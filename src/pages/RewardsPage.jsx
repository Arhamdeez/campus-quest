import Header from '../components/Header'
import StatRow from '../components/StatRow'

function RewardsPage({ currentUser }) {
  return (
    <>
      <Header icon="👜" title="Rewards Store" subtitle="Redeem your points for awesome rewards" />
      <section className="card hero-balance">
        <small>Your Balance</small>
        <h2>{currentUser?.points ?? 0} Points</h2>
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

export default RewardsPage
