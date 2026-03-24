import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StatRow from '../components/StatRow'

function StudyGroupsPage({ currentUser, groups, onJoinGroup, onLeaveGroup }) {
  const navigate = useNavigate()
  return (
    <>
      <Header icon="📚" title="Study Groups" subtitle="Join study groups and learn together" />
      <StatRow
        stats={[
          { icon: '👥', value: String(groups.length), label: 'Total Groups' },
          {
            icon: '🙋',
            value: String(
              groups.filter((group) => currentUser && group.members.some((member) => member === currentUser.name))
                .length,
            ),
            label: 'Joined Groups',
          },
          {
            icon: '📖',
            value: String(groups.reduce((sum, group) => sum + group.members.length, 0)),
            label: 'Total Members',
            tone: 'ok',
          },
        ]}
      />
      <section className="grid-two">
        {groups.map((group) => (
          <article key={group.id} className="card panel">
            <h4>{group.name}</h4>
            <span className="tag">{group.topic}</span>
            <p>
              {group.schedule} • {group.location}
            </p>
            <small>
              {group.members.length}/{group.capacity} members
            </small>
            {currentUser && group.members.includes(currentUser.name) ? (
              <div className="joined-pill">Joined</div>
            ) : null}
            <div className="button-grid group-actions">
              {currentUser && group.members.includes(currentUser.name) ? (
                <button type="button" className="ghost-btn" onClick={() => onLeaveGroup(group.id)}>
                  Leave Group
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onJoinGroup(group.id)}
                  disabled={!currentUser || group.members.length >= group.capacity}
                >
                  Join Group
                </button>
              )}
              {currentUser && group.members.includes(currentUser.name) ? (
                <button type="button" className="ghost-btn" onClick={() => navigate(`/study-groups/${group.id}`)}>
                  Open Chat
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </>
  )
}

export default StudyGroupsPage
