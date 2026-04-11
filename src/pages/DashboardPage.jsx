import Header from '../components/Header'
import StatRow from '../components/StatRow'
import { useUserSchedule } from '../hooks/useUserSchedule'
import { useNavigate } from 'react-router-dom'

function DashboardPage({ currentUser }) {
  const navigate = useNavigate()
  const { stats: classStats } = useUserSchedule(currentUser?.uid)

  return (
    <>
      <Header icon="🏆" title="Student Dashboard" subtitle="Your all-in-one campus engagement center" />
      <StatRow
        stats={[
          { icon: '🏅', value: String(currentUser?.points ?? 0), label: 'Points' },
          { icon: '📚', value: String(classStats.attended), label: 'Classes attended', tone: 'ok' },
          { icon: '⏭️', value: String(classStats.missed), label: 'Classes missed' },
          { icon: '🎁', value: '8', label: 'Rewards Available', tone: 'warn' },
        ]}
      />
      <section className="grid-two">
        <article className="card panel">
          <h3>Quick Actions</h3>
          <div className="button-grid">
            <button type="button" onClick={() => navigate('/challenges')}>
              Browse Challenges
            </button>
            <button type="button" onClick={() => navigate('/study-groups')}>
              Join Study Group
            </button>
            <button type="button" onClick={() => navigate('/quizzes')}>
              Take Quiz
            </button>
            <button type="button" onClick={() => navigate('/classes')}>
              Classes & attendance
            </button>
            <button type="button" onClick={() => navigate('/rewards')}>
              Explore Rewards
            </button>
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

export default DashboardPage
