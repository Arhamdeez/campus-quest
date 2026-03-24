import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import ShapeGrid from './ShapeGrid'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/events', label: 'Events' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/study-groups', label: 'Study Groups' },
  { to: '/quizzes', label: 'Quizzes' },
  { to: '/rewards', label: 'Rewards' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/profile', label: 'Profile' },
]

const leaderboard = [
  ['Emma Wilson', 312, 15, '6/6', 20],
  ['Sarah Johnson', 245, 12, '4/6', 15],
  ['Alex Chen', 198, 8, '3/6', 12],
  ['Muhammad Arham Babar', 0, 0, '0/6', 0],
]

const eventFeed = [
  ['AI Career Fair', 'Mar 28, 11:00 AM', 'Main Hall', 120],
  ['Hack Night', 'Apr 01, 5:30 PM', 'Innovation Lab', 150],
  ['Volunteer Drive', 'Apr 03, 9:00 AM', 'Campus Lawn', 80],
]

const dummyUsers = [
  {
    id: 'u1',
    name: 'Muhammad Arham Babar',
    email: 'arham@campus.edu',
    role: 'Student',
    points: 0,
  },
  {
    id: 'u2',
    name: 'Emma Wilson',
    email: 'emma@campus.edu',
    role: 'Student',
    points: 312,
  },
  {
    id: 'u3',
    name: 'Sarah Johnson',
    email: 'sarah@campus.edu',
    role: 'Student',
    points: 245,
  },
]

function AppShell({ children, currentUser, onLogout }) {
  return (
    <div className="page-frame">
      <div className="shapegrid-bg" aria-hidden="true">
        <ShapeGrid
          speed={0.22}
          direction="diagonal"
          borderColor="rgba(245, 247, 255, 0.34)"
          hoverColor="rgba(255, 255, 255, 0.2)"
          size={16}
          shape="hexagon"
          hoverTrailAmount={2}
        />
      </div>
      <div className="app-shell">
        <header className="topbar card">
          <div className="brand">CampusQuest</div>
          <nav className="nav-list">
            {navLinks.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="auth-status">
            <span>{currentUser ? `Logged in: ${currentUser.name}` : 'Not logged in'}</span>
            {currentUser ? (
              <button type="button" className="ghost-btn" onClick={onLogout}>
                Logout
              </button>
            ) : null}
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}

function Header({ icon, title, subtitle }) {
  return (
    <section className="page-header">
      <div className="icon-badge">{icon}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  )
}

function StatRow({ stats }) {
  return (
    <section className="stat-grid">
      {stats.map((s) => (
        <article key={s.label} className={`stat-card ${s.tone ?? ''}`}>
          <span>{s.icon}</span>
          <strong>{s.value}</strong>
          <small>{s.label}</small>
        </article>
      ))}
    </section>
  )
}

function DashboardPage() {
  return (
    <>
      <Header icon="🏆" title="Student Dashboard" subtitle="Your all-in-one campus engagement center" />
      <StatRow
        stats={[
          { icon: '🏅', value: '0', label: 'Points' },
          { icon: '🔥', value: '0', label: 'Current Streak' },
          { icon: '✅', value: '0', label: 'Tasks Completed', tone: 'ok' },
          { icon: '🎁', value: '8', label: 'Rewards Available', tone: 'warn' },
        ]}
      />
      <section className="grid-two">
        <article className="card panel">
          <h3>Quick Actions</h3>
          <div className="button-grid">
            <button type="button">Browse Challenges</button>
            <button type="button">Join Study Group</button>
            <button type="button">Take Quiz</button>
            <button type="button">Explore Rewards</button>
          </div>
        </article>
        <article className="card panel">
          <h3>Priority Today</h3>
          <ul className="list">
            <li>Complete one daily challenge</li>
            <li>Attempt one quiz</li>
            <li>RSVP to one event</li>
          </ul>
        </article>
      </section>
    </>
  )
}

function ChallengesPage() {
  const challenges = [
    ['Early Bird', 'Attend a class before 9 AM', '15', 'Expired'],
    ['Social Butterfly', 'Meet 3 new students today', '10', 'Expired'],
    ['Library Lover', 'Spend 1 hour in the library', '12', 'Expired'],
  ]
  return (
    <>
      <Header icon="🎯" title="Daily Challenges" subtitle="Complete challenges to earn bonus points" />
      <StatRow
        stats={[
          { icon: '🎯', value: '3', label: 'Active Challenges' },
          { icon: '✅', value: '0', label: 'Completed' },
          { icon: '🏆', value: '37', label: 'Total Points Available' },
        ]}
      />
      <section className="card panel">
        {challenges.map((c) => (
          <article key={c[0]} className="list-row">
            <div>
              <h4>{c[0]}</h4>
              <p>{c[1]}</p>
            </div>
            <div className="row-meta">
              <span>{c[2]} pts</span>
              <small>{c[3]}</small>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}

function RewardsPage() {
  return (
    <>
      <Header icon="👜" title="Rewards Store" subtitle="Redeem your points for awesome rewards" />
      <section className="card hero-balance">
        <small>Your Balance</small>
        <h2>0 Points</h2>
      </section>
      <StatRow
        stats={[
          { icon: '✨', value: '8', label: 'Total Items' },
          { icon: '✅', value: '0', label: 'Purchased' },
          { icon: '🗂️', value: '8', label: 'Available' },
          { icon: '🏆', value: '985', label: 'Total Value' },
        ]}
      />
      <section className="grid-three">
        {['Golden Crown Avatar', 'Sunglasses Avatar', 'Wizard Hat Avatar'].map((item) => (
          <article key={item} className="card product">
            <div className="emoji">👑</div>
            <h4>{item}</h4>
            <p>Unlock this reward for your profile personalization.</p>
          </article>
        ))}
      </section>
    </>
  )
}

function FeedbackPage() {
  return (
    <>
      <Header icon="🗳️" title="Feedback & Polls" subtitle="Share your thoughts and participate in campus polls" />
      <StatRow
        stats={[
          { icon: '📊', value: '0', label: 'Active Polls' },
          { icon: '💬', value: '0', label: 'Total Feedback' },
          { icon: '✅', value: '0', label: 'Polls Participated', tone: 'ok' },
        ]}
      />
      <section className="card empty">
        <h4>No active polls at the moment</h4>
        <p>Your voice matters. Check back for new campus polls.</p>
      </section>
    </>
  )
}

function QuizzesPage() {
  const quizzes = [
    ['Data Structures Basics', 'Test your knowledge of fundamentals', 30, '10 min', 3],
    ['Calculus Quick Quiz', 'Test your understanding of calculus concepts', 20, '5 min', 2],
    ['React Fundamentals', 'Test your React knowledge', 35, '15 min', 3],
  ]
  return (
    <>
      <Header icon="🧠" title="Learning Quizzes" subtitle="Test your knowledge and earn points" />
      <StatRow
        stats={[
          { icon: '🧠', value: '3', label: 'Total Quizzes' },
          { icon: '✅', value: '0', label: 'Completed', tone: 'ok' },
          { icon: '🏆', value: '0', label: 'Total Score' },
        ]}
      />
      <section className="grid-two">
        {quizzes.map((q) => (
          <article key={q[0]} className="card panel">
            <h4>{q[0]}</h4>
            <p>{q[1]}</p>
            <small>
              {q[2]} pts • {q[3]} • {q[4]} questions
            </small>
            <button type="button">Start Quiz</button>
          </article>
        ))}
      </section>
    </>
  )
}

function StudyGroupsPage() {
  const groups = [
    ['Data Structures Study Group', 'Computer Science', 'Tuesdays 6:00 PM', 'Library Room 203', '2/6'],
    ['Calculus Problem Solvers', 'Mathematics', 'Thursday 4:00 PM', 'Study Hall B', '1/5'],
    ['Web Development Workshop', 'Computer Science', 'Friday 5:30 PM', 'Lab 2', '3/8'],
  ]
  return (
    <>
      <Header icon="📚" title="Study Groups" subtitle="Join study groups and learn together" />
      <StatRow
        stats={[
          { icon: '👥', value: '3', label: 'Total Groups' },
          { icon: '🙋', value: '0', label: 'Joined Groups' },
          { icon: '📖', value: '6', label: 'Total Members', tone: 'ok' },
        ]}
      />
      <section className="grid-two">
        {groups.map((g) => (
          <article key={g[0]} className="card panel">
            <h4>{g[0]}</h4>
            <span className="tag">{g[1]}</span>
            <p>
              {g[2]} • {g[3]}
            </p>
            <small>{g[4]} members</small>
            <button type="button">Join Group</button>
          </article>
        ))}
      </section>
    </>
  )
}

function LeaderboardPage() {
  return (
    <>
      <Header icon="🏅" title="Leaderboard" subtitle="Compete with fellow students and climb the ranks" />
      <StatRow
        stats={[
          { icon: '🏅', value: '4', label: 'Active Students' },
          { icon: '🥇', value: '312', label: 'Top Score' },
          { icon: '📈', value: '189', label: 'Average Points', tone: 'ok' },
        ]}
      />
      <section className="card panel">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Points</th>
              <th>Streak</th>
              <th>Badges</th>
              <th>Classes</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, index) => (
              <tr key={row[0]}>
                <td>#{index + 1}</td>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

function ProfilePage({ currentUser, onLogin, onLogout, loginError }) {
  return (
    <>
      <Header icon="👤" title="Profile" subtitle="Track your growth and unlock achievements" />
      {currentUser ? (
        <section className="card profile-card">
          <div className="avatar">
            {currentUser.name
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <h3>{currentUser.name}</h3>
            <p>{currentUser.email}</p>
            <span className="tag">
              {currentUser.role} • {currentUser.points} Points
            </span>
          </div>
          <button type="button" className="ghost-btn profile-logout" onClick={onLogout}>
            Logout
          </button>
        </section>
      ) : (
        <section className="card panel">
          <h3>Dummy Login</h3>
          <p>Use email + password to login. (Dummy: any listed email, password `1234`)</p>
          <form className="login-form" onSubmit={onLogin}>
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            {loginError ? <small className="error-text">{loginError}</small> : null}
            <button type="submit">Login</button>
          </form>
        </section>
      )}
      <StatRow
        stats={[
          { icon: '🏆', value: currentUser ? currentUser.points : '0', label: 'Total Points' },
          { icon: '🔥', value: '0', label: 'Current Streak', tone: 'warn' },
          { icon: '📅', value: '0', label: 'Classes Attended' },
          { icon: '🎉', value: '0', label: 'Events Attended', tone: 'ok' },
          { icon: '🎯', value: '0', label: 'Challenges Done' },
        ]}
      />
      <section className="card empty">
        <h4>Earned Badges (0/6)</h4>
        <p>No badges earned yet. Keep participating to unlock your first badge.</p>
      </section>
    </>
  )
}

function EventsPage() {
  return (
    <>
      <Header icon="📅" title="Campus Events" subtitle="Important events with high point value first" />
      <StatRow
        stats={[
          { icon: '📌', value: '3', label: 'Upcoming Events' },
          { icon: '📩', value: '0', label: 'RSVPs Made' },
          { icon: '🏆', value: '350', label: 'Points Available' },
        ]}
      />
      <section className="card panel">
        {eventFeed.map((event) => (
          <article key={event[0]} className="list-row">
            <div>
              <h4>{event[0]}</h4>
              <p>
                {event[1]} • {event[2]}
              </p>
            </div>
            <div className="row-meta">
              <span>{event[3]} pts</span>
              <button type="button">RSVP</button>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}

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

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('campusquest-current-user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('campusquest-current-user')
    }
  }, [currentUser])

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

    setLoginError('')
    setCurrentUser(user)
    event.currentTarget.reset()
  }

  const logout = () => {
    setCurrentUser(null)
    setLoginError('')
  }

  return (
    <BrowserRouter>
      <AppShell currentUser={currentUser} onLogout={logout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/study-groups" element={<StudyGroupsPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
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
