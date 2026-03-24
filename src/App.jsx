import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppShell from './components/AppShell'
import { dummyUsers, initialStudyGroups } from './data/mockData'
import ChallengesPage from './pages/ChallengesPage'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import FeedbackPage from './pages/FeedbackPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import QuizzesPage from './pages/QuizzesPage'
import RewardsPage from './pages/RewardsPage'
import StudyGroupChatPage from './pages/StudyGroupChatPage'
import StudyGroupsPage from './pages/StudyGroupsPage'

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('campusquest-current-user')
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  })
  const [loginError, setLoginError] = useState('')
  const [studyGroups, setStudyGroups] = useState(initialStudyGroups)
  const [quizResults, setQuizResults] = useState({})
  const [awardedActionKeys, setAwardedActionKeys] = useState(() => {
    const storedUser = localStorage.getItem('campusquest-current-user')
    if (!storedUser) return []
    try {
      const parsedUser = JSON.parse(storedUser)
      if (!parsedUser?.email) return []
      const storedAwards = localStorage.getItem(`campusquest-awards-${parsedUser.email}`)
      if (!storedAwards) return []
      const parsedAwards = JSON.parse(storedAwards)
      return Array.isArray(parsedAwards) ? parsedAwards : []
    } catch {
      return []
    }
  })
  const [userPointsByEmail, setUserPointsByEmail] = useState(() => {
    const stored = localStorage.getItem('campusquest-user-points')
    if (!stored) return {}
    try {
      const parsed = JSON.parse(stored)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('campusquest-current-user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('campusquest-current-user')
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    const key = `campusquest-awards-${currentUser.email}`
    localStorage.setItem(key, JSON.stringify(awardedActionKeys))
  }, [awardedActionKeys, currentUser])

  useEffect(() => {
    localStorage.setItem('campusquest-user-points', JSON.stringify(userPointsByEmail))
  }, [userPointsByEmail])

  const awardPoints = ({ amount, actionKey }) => {
    if (!currentUser || !amount || !actionKey) return false
    if (awardedActionKeys.includes(actionKey)) return false

    setCurrentUser((prev) => {
      if (!prev) return prev
      const nextPoints = (prev.points || 0) + amount
      setUserPointsByEmail((all) => ({ ...all, [prev.email]: nextPoints }))
      return { ...prev, points: nextPoints }
    })
    setAwardedActionKeys((prev) => [...prev, actionKey])
    return true
  }

  const login = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const password = String(formData.get('password') || '')

    const user = dummyUsers.find((item) => item.email.toLowerCase() === email)
    if (!user || password !== '1234') {
      setLoginError('Invalid email or password')
      return
    }

    const savedPoints = userPointsByEmail[user.email]
    const storedAwards = localStorage.getItem(`campusquest-awards-${user.email}`)
    let parsedAwards = []
    try {
      parsedAwards = storedAwards ? JSON.parse(storedAwards) : []
    } catch {
      parsedAwards = []
    }
    setLoginError('')
    setAwardedActionKeys(Array.isArray(parsedAwards) ? parsedAwards : [])
    setCurrentUser({ ...user, points: savedPoints ?? user.points })
    event.currentTarget.reset()
  }

  const logout = () => {
    setCurrentUser(null)
    setLoginError('')
    setAwardedActionKeys([])
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
                onLogin={login}
                onLogout={logout}
                loginError={loginError}
              />
            }
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
