import { NavLink } from 'react-router-dom'
import Prism from './Prism/Prism'
import { navLinks } from '../data/mockData'

function AppShell({ children, currentUser }) {
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
        <main>{children}</main>
      </div>
    </div>
  )
}

export default AppShell
