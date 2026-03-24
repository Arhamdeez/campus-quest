import Header from '../components/Header'
import StatRow from '../components/StatRow'

function DashboardPage({ currentUser }) {
  return (
    <>
      <Header icon="🏆" title="Student Dashboard" subtitle="Your all-in-one campus engagement center" />
      <StatRow
        stats={[
          { icon: '🏅', value: String(currentUser?.points ?? 0), label: 'Points' },
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

export default DashboardPage
