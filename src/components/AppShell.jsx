import { NavLink } from 'react-router-dom'
import ShapeGrid from '../ShapeGrid'
import { navLinks } from '../data/mockData'

function AppShell({ children, currentUser }) {
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
            <span>{currentUser ? `${currentUser.name} • ${currentUser.points} pts` : 'Not logged in'}</span>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}

export default AppShell
