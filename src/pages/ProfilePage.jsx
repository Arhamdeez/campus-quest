import Header from '../components/Header'
import StatRow from '../components/StatRow'

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

export default ProfilePage
