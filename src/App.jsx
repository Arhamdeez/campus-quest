import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppShell from './components/AppShell'
import PostLoginClassPrompt from './components/PostLoginClassPrompt'
import { initialStudyGroups } from './data/mockData'
import { auth, db, firebaseInitError } from './lib/firebase'
import { resolveUserDisplayName } from './lib/userDisplayName'
import ClassesPage from './pages/ClassesPage'
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
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { get, onValue, ref, runTransaction, set } from 'firebase/database'

const ADMIN_EMAILS = ['l226619@lhr.nu.edu.pk']

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [dbWarning, setDbWarning] = useState('')
  const [studyGroups, setStudyGroups] = useState(initialStudyGroups)
  const [quizResults, setQuizResults] = useState({})
  const [awardedActionKeys, setAwardedActionKeys] = useState([])
  const [pointsSummary, setPointsSummary] = useState({
    total: 0,
    byCategory: { classes: 0, events: 0, challenges: 0, quizzes: 0, studyGroups: 0, other: 0 },
  })
  /** Set during sign-up so the first RTDB write can use the chosen display name (not the email prefix). */
  const pendingSignupProfile = useRef(null)

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
        setPointsSummary({
          total: 0,
          byCategory: { classes: 0, events: 0, challenges: 0, quizzes: 0, studyGroups: 0, other: 0 },
        })
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
          const fromPending = pendingSignupProfile.current
          pendingSignupProfile.current = null
          const defaultName = fromPending?.displayName?.trim() || resolveUserDisplayName(user, {})
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
          name: resolveUserDisplayName(user, profile),
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
            name: resolveUserDisplayName(user, {}),
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
        const awardedActions = stats?.awardedActions && typeof stats.awardedActions === 'object' ? stats.awardedActions : {}
        const awardedKeys = Object.keys(awarded).filter((k) => awarded[k])
        const byCategory = {
          classes: 0,
          events: 0,
          challenges: 0,
          quizzes: 0,
          studyGroups: 0,
          other: 0,
        }

        for (const action of Object.values(awardedActions)) {
          const amount = Number(action?.amount || 0)
          if (amount <= 0) continue
          const category = String(action?.category || 'other')
          if (Object.prototype.hasOwnProperty.call(byCategory, category)) {
            byCategory[category] += amount
          } else {
            byCategory.other += amount
          }
        }

        const trackedTotal = Object.values(byCategory).reduce((sum, value) => sum + value, 0)
        if (points > trackedTotal) {
          byCategory.other += points - trackedTotal
        }

        setCurrentUser((prev) => (prev ? { ...prev, points } : prev))
        setAwardedActionKeys(awardedKeys)
        setPointsSummary({ total: points, byCategory })
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

  /** Public leaderboard row — readable by all signed-in users while `users/$uid` stays private. */
  useEffect(() => {
    if (!firebaseReady || !db || !currentUser?.uid) return undefined
    const uid = currentUser.uid
    const statsR = ref(db, `users/${uid}/stats`)
    const profileR = ref(db, `users/${uid}/profile`)
    const attR = ref(db, `users/${uid}/schedule/attendance`)

    let stats = {}
    let profile = {}
    let attendance = {}

    const pushLeaderboardPublic = () => {
      const points = Number(stats?.points || 0)
      const streak = Number(stats?.streak || 0)
      const classesAttended = Object.values(attendance).filter((entry) => entry?.attended === true).length
      const rawName = profile?.name || profile?.email || 'Student'
      set(ref(db, `leaderboard/${uid}`), {
        name: String(rawName).trim() || 'Student',
        points,
        streak,
        classesAttended,
        updatedAt: Date.now(),
      }).catch((err) => console.error(err))
    }

    const unsubStats = onValue(statsR, (snap) => {
      stats = snap.exists() ? snap.val() || {} : {}
      pushLeaderboardPublic()
    })
    const unsubProfile = onValue(profileR, (snap) => {
      profile = snap.exists() ? snap.val() || {} : {}
      pushLeaderboardPublic()
    })
    const unsubAtt = onValue(attR, (snap) => {
      attendance = snap.exists() ? snap.val() || {} : {}
      pushLeaderboardPublic()
    })

    return () => {
      unsubStats()
      unsubProfile()
      unsubAtt()
    }
  }, [firebaseReady, currentUser?.uid])

  const awardPoints = async ({ amount, actionKey, category = 'other', label = '' }) => {
    if (!firebaseReady) return false
    if (!currentUser?.uid || !amount || !actionKey) return false
    if (awardedActionKeys.includes(actionKey)) return false

    const statsRef = ref(db, `users/${currentUser.uid}/stats`)
    let granted = false
    const txResult = await runTransaction(statsRef, (stats) => {
      const next = stats && typeof stats === 'object' ? stats : {}
      const currentPoints = Number(next.points || 0)
      const awarded = next.awardedActionKeys && typeof next.awardedActionKeys === 'object' ? next.awardedActionKeys : {}
      const awardedActions = next.awardedActions && typeof next.awardedActions === 'object' ? next.awardedActions : {}
      if (awarded[actionKey]) return
      granted = true
      return {
        ...next,
        points: currentPoints + amount,
        awardedActionKeys: { ...awarded, [actionKey]: true },
        awardedActions: {
          ...awardedActions,
          [actionKey]: {
            amount,
            category,
            label: label || actionKey,
            awardedAt: Date.now(),
          },
        },
      }
    })
    return Boolean(txResult?.committed && granted)
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

  const signup = async ({ email, password, name }) => {
    if (!firebaseReady) {
      setLoginError(firebaseConfigError || 'Firebase is not configured correctly.')
      return
    }

    const displayName = String(name || '').trim()
    if (!displayName) {
      setLoginError('Please enter your full name.')
      return
    }

    try {
      setLoginError('')
      pendingSignupProfile.current = { displayName }
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName })
      } catch (inner) {
        pendingSignupProfile.current = null
        throw inner
      }
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

  const saveDisplayName = async (name) => {
    if (!firebaseReady || !currentUser?.uid || !auth.currentUser) return
    const trimmed = String(name || '').trim()
    if (!trimmed) {
      throw new Error('Name cannot be empty.')
    }
    const prevName = currentUser?.name
    try {
      await updateProfile(auth.currentUser, { displayName: trimmed })
      await set(ref(db, `users/${currentUser.uid}/profile/name`), trimmed)
      setCurrentUser((prev) => (prev ? { ...prev, name: trimmed } : prev))
      if (prevName && prevName !== trimmed) {
        setStudyGroups((groups) =>
          groups.map((g) => ({
            ...g,
            members: g.members.map((m) => (m === prevName ? trimmed : m)),
            messages: g.messages.map((msg) =>
              msg.author === prevName ? { ...msg, author: trimmed } : msg,
            ),
          })),
        )
      }
    } catch (err) {
      throw new Error(err?.message || 'Could not update your name.')
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
    void awardPoints({
      amount: 10,
      actionKey: `group-join-${groupId}`,
      category: 'studyGroups',
      label: 'Study group joined',
    })
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

  /** Demo-only: scripted messages from other members while a chat is open. */
  const appendSimulatedMessage = useCallback((groupId, { author, text }) => {
    setStudyGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group
        return {
          ...group,
          messages: [
            ...group.messages,
            {
              id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              author,
              text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        }
      }),
    )
  }, [])

  const handleChallengeCompleted = async (challenge) => {
    return awardPoints({
      amount: challenge.points,
      actionKey: `challenge-complete-${challenge.id}`,
      category: 'challenges',
      label: challenge.title || 'Challenge completed',
    })
  }

  const handleEventJoined = async (event) => {
    // Event cards display this value; award exactly what is shown.
    return awardPoints({
      amount: event.points,
      actionKey: `event-join-${event.id}`,
      category: 'events',
      label: event.title || 'Event joined',
    })
  }

  const handleQuizCompleted = async (result) => {
    const previous = quizResults?.[result.id]
    const previousBest = Number(previous?.earnedPoints || 0)
    const latestAttemptScore = Number(result.earnedPoints || 0)
    const nextBest = Math.max(previousBest, latestAttemptScore)
    const bonus = Math.max(0, nextBest - previousBest)

    const storedResult =
      nextBest > previousBest
        ? {
            ...result,
            earnedPoints: nextBest,
            bestEarnedPoints: nextBest,
            lastAttemptEarnedPoints: latestAttemptScore,
          }
        : {
            ...(previous || result),
            bestEarnedPoints: previousBest,
            lastAttemptEarnedPoints: latestAttemptScore,
          }

    setQuizResults((prev) => ({ ...prev, [result.id]: storedResult }))

    if (bonus > 0) {
      await awardPoints({
        amount: bonus,
        actionKey: `quiz-best-${result.id}-${nextBest}`,
        category: 'quizzes',
        label: `${result.title || 'Quiz'} best score`,
      })
    }

    if (firebaseReady && currentUser?.uid) {
      set(ref(db, `users/${currentUser.uid}/quizResults/${result.id}`), storedResult)
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

  const isAdmin = ADMIN_EMAILS.includes(String(currentUser.email || '').trim().toLowerCase())

  return (
    <BrowserRouter>
      <AppShell currentUser={currentUser} pointsSummary={pointsSummary}>
        <PostLoginClassPrompt currentUser={currentUser} awardPoints={awardPoints} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage currentUser={currentUser} />} />
          <Route path="/classes" element={<ClassesPage currentUser={currentUser} awardPoints={awardPoints} />} />
          <Route path="/leaderboard" element={<LeaderboardPage currentUser={currentUser} />} />
          <Route
            path="/events"
            element={<EventsPage onEventJoined={handleEventJoined} awardedActionKeys={awardedActionKeys} isAdmin={isAdmin} />}
          />
          <Route
            path="/challenges"
            element={<ChallengesPage onChallengeCompleted={handleChallengeCompleted} awardedActionKeys={awardedActionKeys} />}
          />
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
                onSimulatedMessage={appendSimulatedMessage}
              />
            }
          />
          <Route path="/quizzes" element={<QuizzesPage quizResults={quizResults} />} />
          <Route path="/quizzes/:quizId" element={<QuizAttemptPage onQuizCompleted={handleQuizCompleted} />} />
          <Route path="/rewards" element={<RewardsPage currentUser={currentUser} />} />
          <Route path="/feedback" element={<FeedbackPage currentUser={currentUser} isAdmin={isAdmin} />} />
          <Route
            path="/profile"
            element={
              <ProfilePage
                currentUser={currentUser}
                onLogout={logout}
                onSaveDisplayName={saveDisplayName}
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
