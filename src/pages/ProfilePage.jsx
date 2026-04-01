import { useEffect, useState } from 'react'
import Header from '../components/Header'
import StatRow from '../components/StatRow'

function ProfilePage({ currentUser, onLogout, onSaveDisplayName, notice }) {
  const [nameEdit, setNameEdit] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNameEdit(currentUser?.name || '')
  }, [currentUser?.name])

  const handleSaveName = async (event) => {
    event.preventDefault()
    if (!onSaveDisplayName) return
    const trimmed = String(nameEdit || '').trim()
    if (!trimmed) {
      setSaveError('Enter your full name.')
      return
    }
    if (trimmed === currentUser?.name) {
      setSaveError('')
      return
    }
    setSaveError('')
    setSaving(true)
    try {
      await onSaveDisplayName(trimmed)
    } catch (err) {
      setSaveError(err?.message || 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header icon="👤" title="Profile" subtitle="Track your growth and unlock achievements" />
      {notice ? (
        <section className="card panel" style={{ maxWidth: 920, margin: '0 auto' }}>
          <small className="error-text">{notice}</small>
        </section>
      ) : null}
      {currentUser ? (
        <section className="card profile-card">
          <div className="avatar">
            {currentUser.name
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="profile-card-body">
            <h3>{currentUser.name}</h3>
            <p>{currentUser.email}</p>
            <span className="tag">
              {currentUser.role} • {currentUser.points} Points
            </span>
            <form className="profile-name-form" onSubmit={handleSaveName}>
              <label htmlFor="profile-display-name">Display name</label>
              <div className="profile-name-row">
                <input
                  id="profile-display-name"
                  name="displayName"
                  type="text"
                  value={nameEdit}
                  onChange={(e) => setNameEdit(e.target.value)}
                  autoComplete="name"
                  placeholder="Your full name"
                />
                <button type="submit" className="ghost-btn" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
              {saveError ? <small className="error-text">{saveError}</small> : null}
            </form>
          </div>
          <button type="button" className="ghost-btn profile-logout" onClick={onLogout}>
            Logout
          </button>
        </section>
      ) : null}
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
