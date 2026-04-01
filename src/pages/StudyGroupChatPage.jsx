import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { FALLBACK_LIVE_LINES, LIVE_CHAT_LINES_BY_GROUP } from '../data/studyGroupLiveChat'

function StudyGroupChatPage({
  currentUser,
  groups,
  onJoinGroup,
  onLeaveGroup,
  onSendMessage,
  onSimulatedMessage,
}) {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const group = groups.find((item) => item.id === groupId)
  const listEndRef = useRef(null)

  /** While chat is open, other members post scripted lines on a staggered timer (demo). */
  useEffect(() => {
    if (!group || !currentUser) return
    const joined = group.members.includes(currentUser.name)
    if (!joined) return

    const others = group.members.filter((m) => m !== currentUser.name)
    if (others.length === 0) return

    const pool = LIVE_CHAT_LINES_BY_GROUP[group.id] || FALLBACK_LIVE_LINES
    let lineIndex = 0
    let timeoutId = null

    const run = () => {
      const author = others[lineIndex % others.length]
      const text = pool[lineIndex % pool.length]
      lineIndex += 1
      onSimulatedMessage(group.id, { author, text })
      const delay = 2500 + Math.random() * 4500
      timeoutId = window.setTimeout(run, delay)
    }

    timeoutId = window.setTimeout(run, 900 + Math.random() * 900)
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [group?.id, group?.members, currentUser?.name, onSimulatedMessage])

  useEffect(() => {
    if (!group || !currentUser) return
    if (!group.members.includes(currentUser.name)) return
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [group?.messages?.length, currentUser?.name])

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
                <article
                  key={message.id}
                  className={`chat-item ${message.author === currentUser.name ? 'chat-item--self' : ''}`}
                >
                  <div className="chat-meta">
                    <strong>{message.author}</strong>
                    <small>{message.time}</small>
                  </div>
                  <p>{message.text}</p>
                </article>
              ))}
              <div ref={listEndRef} className="chat-list-end" aria-hidden />
            </div>

            <form className="chat-form" onSubmit={handleChatSubmit}>
              <input name="message" placeholder="Write a message..." autoComplete="off" />
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
