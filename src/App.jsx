import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppShell from './components/AppShell'
import { initialStudyGroups } from './data/mockData'
import { auth, db, firebaseInitError } from './lib/firebase'
import ChallengesPage from './pages/ChallengesPage'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import FeedbackPage from './pages/FeedbackPage'
import LeaderboardPage from './pages/LeaderboardPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import QuizzesPage from './pages/QuizzesPage'
import RewardsPage from './pages/RewardsPage'
import StudyGroupChatPage from './pages/StudyGroupChatPage'
import StudyGroupsPage from './pages/StudyGroupsPage'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { get, onValue, ref, runTransaction, set } from 'firebase/database'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [dbWarning, setDbWarning] = useState('')
  const [studyGroups, setStudyGroups] = useState(initialStudyGroups)
  const [quizResults, setQuizResults] = useState({})
  const [awardedActionKeys, setAwardedActionKeys] = useState([])

  const firebaseConfigError =
    firebaseInitError?.message || (!auth || !db ? 'Firebase is not configured correctly (auth/db unavailable).' : '')
  const firebaseReady = !firebaseConfigError

  useEffect(() => {
    if (firebaseConfigError) return

    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setCurrentUser(null)
        setQuizResults({})
        setAwardedActionKeys([])
        setLoginError('')
        setDbWarning('')
        setAuthChecked(true)
        return
      }

      try {
        const userRef = ref(db, `users/${user.uid}`)
        const snap = await get(userRef)
        const existing = snap.exists() ? snap.val() : null

        if (!existing) {
          const defaultName = user.email ? user.email.split('@')[0] : 'Student'
          const record = {
            profile: {
              name: defaultName,
              email: user.email || '',
              role: 'Student',
              createdAt: Date.now(),
            },
            stats: {
              points: 0,
              awardedActionKeys: {},
            },
            quizResults: {},
          }
          await set(userRef, record)
          setCurrentUser({ uid: user.uid, ...record.profile, points: 0 })
          setLoginError('')
          setAuthChecked(true)
          return
        }

        const profile = existing.profile || {}
        // Stats + quiz results are kept in sync via RTDB subscriptions below.
        setCurrentUser({
          uid: user.uid,
          name: profile.name || (user.email ? user.email.split('@')[0] : 'Student'),
          email: profile.email || user.email || '',
          role: profile.role || 'Student',
          points: 0,
        })
        setLoginError('')
        setAuthChecked(true)
      } catch (err) {
        console.error(err)
        const isPermissionDenied =
          String(err?.message || '').toLowerCase().includes('permission denied') ||
          String(err?.code || '').toLowerCase().includes('permission-denied')

        if (isPermissionDenied) {
          setDbWarning(
            'Signed in, but Realtime Database rules are blocking access (Permission denied). Update RTDB Rules to allow users to read/write their own data.',
          )
          setCurrentUser({
            uid: user.uid,
            name: user.email ? user.email.split('@')[0] : 'Student',
            email: user.email || '',
            role: 'Student',
            points: 0,
          })
          setQuizResults({})
          setAwardedActionKeys([])
          setLoginError('')
          setAuthChecked(true)
          return
        }

        setLoginError('Failed to load account. Check database rules/config.')
        setDbWarning('')
        setAuthChecked(true)
      }
    })

    return () => unsub()
  }, [firebaseConfigError])

  useEffect(() => {
    if (!firebaseReady) return undefined
    if (!currentUser?.uid) return undefined

    const statsRef = ref(db, `users/${currentUser.uid}/stats`)
    const quizResultsRef = ref(db, `users/${currentUser.uid}/quizResults`)

    const unsubStats = onValue(
      statsRef,
      (snap) => {
        const stats = snap.exists() ? snap.val() : {}
        const points = Number(stats?.points || 0)
        const awarded = stats?.awardedActionKeys && typeof stats.awardedActionKeys === 'object' ? stats.awardedActionKeys : {}
        const awardedKeys = Object.keys(awarded).filter((k) => awarded[k])

        setCurrentUser((prev) => (prev ? { ...prev, points } : prev))
        setAwardedActionKeys(awardedKeys)
        setDbWarning('')
      },
      (err) => {
        console.error(err)
        setDbWarning('Realtime Database is not accessible (Permission denied).')
      },
    )

    const unsubQuiz = onValue(
      quizResultsRef,
      (snap) => {
        setQuizResults(snap.exists() ? snap.val() : {})
      },
      (err) => {
        console.error(err)
      },
    )

    return () => {
      unsubStats()
      unsubQuiz()
    }
  }, [currentUser?.uid, firebaseReady])

  const awardPoints = ({ amount, actionKey }) => {
    if (!firebaseReady) return false
    if (!currentUser?.uid || !amount || !actionKey) return false
    if (awardedActionKeys.includes(actionKey)) return false

    const statsRef = ref(db, `users/${currentUser.uid}/stats`)
    runTransaction(statsRef, (stats) => {
      const next = stats && typeof stats === 'object' ? stats : {}
      const currentPoints = Number(next.points || 0)
      const awarded = next.awardedActionKeys && typeof next.awardedActionKeys === 'object' ? next.awardedActionKeys : {}
      if (awarded[actionKey]) return next
      return {
        ...next,
        points: currentPoints + amount,
        awardedActionKeys: { ...awarded, [actionKey]: true },
      }
    })
    // UI will update via RTDB subscription.
    return true
  }

  const login = async ({ email, password }) => {
    if (!firebaseReady) {
      setLoginError(firebaseConfigError || 'Firebase is not configured correctly.')
      return
    }

    try {
      setLoginError('')
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        setLoginError('Incorrect email or password.')
        return
      }
      if (err?.code === 'auth/user-not-found') {
        setLoginError('No account found for this email.')
        return
      }
      setLoginError(err?.message || 'Login failed.')
    }
  }

  const signup = async ({ email, password }) => {
    if (!firebaseReady) {
      setLoginError(firebaseConfigError || 'Firebase is not configured correctly.')
      return
    }

    try {
      setLoginError('')
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err) {
      if (err?.code === 'auth/email-already-in-use') {
        setLoginError('This email is already registered. Try logging in instead.')
        return
      }
      if (err?.code === 'auth/weak-password') {
        setLoginError('Password is too weak. Use at least 6 characters.')
        return
      }
      setLoginError(err?.message || 'Failed to create account.')
    }
  }

  const logout = async () => {
    if (!firebaseReady) {
      setLoginError(firebaseConfigError || 'Firebase is not configured correctly.')
      return
    }
    await signOut(auth)
    setLoginError('')
  }

  const joinGroup = (groupId) => {
    if (!currentUser) return
    setStudyGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group
        if (group.members.includes(currentUser.name)) return group
        if (group.members.length >= group.capacity) return group
        return {
          ...group,
          members: [...group.members, currentUser.name],
          messages: [
            ...group.messages,
            {
              id: `join-${Date.now()}`,
              author: 'System',
              text: `${currentUser.name} joined the group.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        }
      }),
    )
    awardPoints({ amount: 8, actionKey: `group-join-${groupId}` })
  }

  const leaveGroup = (groupId) => {
    if (!currentUser) return
    setStudyGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group
        if (!group.members.includes(currentUser.name)) return group
        return {
          ...group,
          members: group.members.filter((member) => member !== currentUser.name),
          messages: [
            ...group.messages,
            {
              id: `leave-${Date.now()}`,
              author: 'System',
              text: `${currentUser.name} left the group.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        }
      }),
    )
  }

  const sendGroupMessage = (groupId, text) => {
    if (!currentUser) return
    setStudyGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group
        return {
          ...group,
          messages: [
            ...group.messages,
            {
              id: `msg-${Date.now()}`,
              author: currentUser.name,
              text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        }
      }),
    )
  }

  const handleChallengeCompleted = (challenge) => {
    awardPoints({ amount: challenge.points, actionKey: `challenge-complete-${challenge.id}` })
  }

  const handleEventJoined = (event) => {
    // Joining gives a smaller reward than event completion to keep balance.
    const joinReward = Math.max(10, Math.round(event.points * 0.35))
    awardPoints({ amount: joinReward, actionKey: `event-join-${event.id}` })
  }

  const handleQuizCompleted = (result) => {
    setQuizResults((prev) => ({ ...prev, [result.id]: result }))
    awardPoints({ amount: result.earnedPoints, actionKey: `quiz-complete-${result.id}` })
    if (firebaseReady && currentUser?.uid) {
      set(ref(db, `users/${currentUser.uid}/quizResults/${result.id}`), result)
    }
  }

  if (!firebaseReady) {
    return (
      <BrowserRouter>
        <Routes>
          <Route
            path="*"
            element={
              <LoginPage error={firebaseConfigError || 'Firebase is not configured correctly.'} onLogin={login} onSignup={signup} />
            }
          />
        </Routes>
      </BrowserRouter>
    )
  }

  if (!authChecked) {
    return (
      <section className="card panel" style={{ maxWidth: 560, margin: '40px auto' }}>
        <h3>Loading…</h3>
        <p>Checking your session.</p>
      </section>
    )
  }

  if (!currentUser) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage error={loginError} onLogin={login} onSignup={signup} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <AppShell currentUser={currentUser}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage currentUser={currentUser} />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/events" element={<EventsPage onEventJoined={handleEventJoined} />} />
          <Route path="/challenges" element={<ChallengesPage onChallengeCompleted={handleChallengeCompleted} />} />
          <Route
            path="/study-groups"
            element={
              <StudyGroupsPage
                currentUser={currentUser}
                groups={studyGroups}
                onJoinGroup={joinGroup}
                onLeaveGroup={leaveGroup}
              />
            }
          />
          <Route
            path="/study-groups/:groupId"
            element={
              <StudyGroupChatPage
                currentUser={currentUser}
                groups={studyGroups}
                onJoinGroup={joinGroup}
                onLeaveGroup={leaveGroup}
                onSendMessage={sendGroupMessage}
              />
            }
          />
          <Route path="/quizzes" element={<QuizzesPage quizResults={quizResults} />} />
          <Route path="/quizzes/:quizId" element={<QuizAttemptPage onQuizCompleted={handleQuizCompleted} />} />
          <Route path="/rewards" element={<RewardsPage currentUser={currentUser} />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route
            path="/profile"
            element={
              <ProfilePage
                currentUser={currentUser}
                onLogout={logout}
                notice={dbWarning}
              />
            }
          />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
