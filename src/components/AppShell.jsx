import { NavLink } from 'react-router-dom'
import Prism from './Prism/Prism'
import { navLinks } from '../data/mockData'

function AppShell({ children, currentUser, pointsSummary }) {
  return (
    <div className="page-frame">
      <div className="shapegrid-bg" aria-hidden="true">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={0.7}
          noise={0}
          glow={0.6}
          bloom={0.7}
          transparent
        />
      </div>
      <div className="app-shell">
        <header className="topbar card">
          <NavLink to="/" className="brand">
            CampusQuest
          </NavLink>
          <nav className="nav-list">
            {navLinks.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="auth-status">
            <span>{currentUser ? `${currentUser.name} • ${currentUser.points} pts` : 'Not logged in'}</span>
          </div>
        </header>
        <section className="card points-global-strip" aria-label="Points summary">
          <div className="points-global-strip__total">
            <small>Total points</small>
            <strong>{pointsSummary?.total ?? currentUser?.points ?? 0}</strong>
          </div>
          <div className="points-global-strip__parts">
            <span>Classes: {pointsSummary?.byCategory?.classes ?? 0}</span>
            <span>Events: {pointsSummary?.byCategory?.events ?? 0}</span>
            <span>Challenges: {pointsSummary?.byCategory?.challenges ?? 0}</span>
            <span>Quizzes: {pointsSummary?.byCategory?.quizzes ?? 0}</span>
            <span>Study groups: {pointsSummary?.byCategory?.studyGroups ?? 0}</span>
            {(pointsSummary?.byCategory?.other ?? 0) > 0 ? <span>Other: {pointsSummary.byCategory.other}</span> : null}
          </div>
        </section>
        <main>{children}</main>
      </div>
    </div>
  )
}

export default AppShell
