import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'

function StudyGroupChatPage({ currentUser, groups, onJoinGroup, onLeaveGroup, onSendMessage }) {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const group = groups.find((item) => item.id === groupId)

  if (!group) {
    return (
      <section className="card panel">
        <h3>Group not found</h3>
        <button type="button" className="ghost-btn" onClick={() => navigate('/study-groups')}>
          Back to Study Groups
        </button>
      </section>
    )
  }

  const joined = currentUser && group.members.includes(currentUser.name)

  const handleChatSubmit = (event) => {
    event.preventDefault()
    const input = event.currentTarget.elements.message
    const message = String(input.value || '').trim()
    if (!message || !joined) return
    onSendMessage(group.id, message)
    input.value = ''
  }

  return (
    <>
      <Header icon="💬" title={group.name} subtitle="Group chat and collaboration space" />
      <section className="card panel">
        <div className="chat-header">
          <div>
            <h3>{group.name}</h3>
            <p>
              {group.topic} • {group.schedule} • {group.location}
            </p>
          </div>
          <span className="tag">
            {group.members.length}/{group.capacity} members
          </span>
        </div>

        <div className="member-strip">
          <strong>Members:</strong> {group.members.join(', ')}
        </div>

        {!joined ? (
          <div className="chat-locked">
            <p>Join this group to view and participate in chat.</p>
            <button type="button" onClick={() => onJoinGroup(group.id)}>
              Join Group
            </button>
          </div>
        ) : (
          <>
            <div className="chat-actions">
              <button type="button" className="ghost-btn" onClick={() => onLeaveGroup(group.id)}>
                Leave Group
              </button>
            </div>
            <div className="chat-list">
              {group.messages.map((message) => (
                <article key={message.id} className="chat-item">
                  <div className="chat-meta">
                    <strong>{message.author}</strong>
                    <small>{message.time}</small>
                  </div>
                  <p>{message.text}</p>
                </article>
              ))}
            </div>

            <form className="chat-form" onSubmit={handleChatSubmit}>
              <input name="message" placeholder="Write a message..." />
              <button type="submit">Send</button>
            </form>
          </>
        )}

        <button type="button" className="ghost-btn chat-back" onClick={() => navigate('/study-groups')}>
          Back to Study Groups
        </button>
      </section>
    </>
  )
}

export default StudyGroupChatPage
