import { useEffect, useMemo, useState } from 'react'
import { onValue, ref, runTransaction, set } from 'firebase/database'
import Header from '../components/Header'
import StatRow from '../components/StatRow'
import { db } from '../lib/firebase'

const initialPolls = [
  {
    id: 'p1',
    title: 'Preferred Hackathon Timing',
    category: 'Events',
    question: 'When should the next campus hackathon be scheduled?',
    options: [
      { id: 'o1', label: 'Weekend (Fri-Sat)', votes: 14 },
      { id: 'o2', label: 'Midweek Evening', votes: 8 },
      { id: 'o3', label: 'Holiday Break', votes: 5 },
    ],
  },
  {
    id: 'p2',
    title: 'Library Hours Extension',
    category: 'Campus Life',
    question: 'Should the library remain open until midnight during exams?',
    options: [
      { id: 'o1', label: 'Yes', votes: 26 },
      { id: 'o2', label: 'No', votes: 6 },
    ],
  },
]

const initialFeedbackThreads = [
  {
    id: 'f1',
    title: 'Share session slides',
    author: 'Fatima Khan',
    area: 'Events',
    message: 'Loved the AI career session. Please share speaker slides afterward.',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    status: 'open',
    createdByAdmin: true,
  },
  {
    id: 'f2',
    title: 'Calendar sync request',
    author: 'Ayesha Malik',
    area: 'Study Groups',
    message: 'Group reminders are useful; add calendar sync for weekly sessions.',
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    status: 'open',
    createdByAdmin: true,
  },
]

const initialRepliesByThread = {
  f1: [
    {
      id: 'r1',
      author: 'Campus Team',
      message: 'Thanks. We will upload slides after the event.',
      createdAt: Date.now() - 23 * 60 * 60 * 1000,
    },
  ],
}

function FeedbackPage({ currentUser, isAdmin = false }) {
  const [polls, setPolls] = useState(initialPolls)
  const [feedbackThreads, setFeedbackThreads] = useState(initialFeedbackThreads)
  const [repliesByThread, setRepliesByThread] = useState(initialRepliesByThread)
  const [selectedPollId, setSelectedPollId] = useState(initialPolls[0].id)
  const [votedPollIds, setVotedPollIds] = useState([])
  const [draftReplies, setDraftReplies] = useState({})
  const [boardError, setBoardError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (!db) return undefined

    const pollsRef = ref(db, 'feedback/polls')
    const threadsRef = ref(db, 'feedback/threads')
    const repliesRef = ref(db, 'feedback/replies')
    const votesRef = ref(db, `feedback/votes/${currentUser?.uid || 'anon'}`)

    const unsubPolls = onValue(
      pollsRef,
      (snap) => {
        const val = snap.exists() ? snap.val() : null
        if (!val) {
          setPolls(initialPolls)
          setSelectedPollId((prev) => prev || initialPolls[0]?.id || null)
          return
        }
        const list = Object.values(val)
          .map((poll) => ({
            ...poll,
            options: Array.isArray(poll.options) ? poll.options : Object.values(poll.options || {}),
          }))
          .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
        setPolls(list)
        setSelectedPollId((prev) => {
          if (prev && list.some((p) => p.id === prev)) return prev
          return list[0]?.id || null
        })
      },
      () => setBoardError('Some feedback data could not be loaded from database rules.'),
    )

    const unsubThreads = onValue(
      threadsRef,
      (snap) => {
        const val = snap.exists() ? snap.val() : null
        if (!val) {
          setFeedbackThreads(initialFeedbackThreads)
          return
        }
        const list = Object.values(val).sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
        setFeedbackThreads(list)
      },
      () => setBoardError('Some feedback data could not be loaded from database rules.'),
    )

    const unsubReplies = onValue(
      repliesRef,
      (snap) => {
        const val = snap.exists() ? snap.val() : null
        if (!val) {
          setRepliesByThread(initialRepliesByThread)
          return
        }
        const parsed = {}
        for (const [threadId, threadReplies] of Object.entries(val)) {
          parsed[threadId] = Object.values(threadReplies || {}).sort(
            (a, b) => (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0),
          )
        }
        setRepliesByThread(parsed)
      },
      () => setBoardError('Some feedback data could not be loaded from database rules.'),
    )

    const unsubVotes = onValue(
      votesRef,
      (snap) => {
        const val = snap.exists() ? snap.val() : {}
        setVotedPollIds(Object.keys(val || {}))
      },
      () => {},
    )

    return () => {
      unsubPolls()
      unsubThreads()
      unsubReplies()
      unsubVotes()
    }
  }, [currentUser?.uid])

  const selectedPoll = polls.find((poll) => poll.id === selectedPollId) || null

  const totalReplies = useMemo(
    () => Object.values(repliesByThread).reduce((sum, replies) => sum + replies.length, 0),
    [repliesByThread],
  )

  const createFeedbackThread = async (event) => {
    event.preventDefault()
    if (!isAdmin) return
    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') || '').trim()
    const area = String(formData.get('area') || '').trim()
    const message = String(formData.get('message') || '').trim()

    if (!title || !area || !message) return

    const id = `fb-${Date.now()}`
    const newEntry = {
      id,
      title,
      author: currentUser?.name || 'Admin',
      area,
      message,
      createdAt: Date.now(),
      status: 'open',
      createdByAdmin: true,
    }

    if (!db) {
      setFeedbackThreads((prev) => [newEntry, ...prev])
      setShowCreateForm(false)
      event.currentTarget.reset()
      return
    }

    try {
      await set(ref(db, `feedback/threads/${id}`), newEntry)
      setShowCreateForm(false)
      setBoardError('')
    } catch (err) {
      console.error(err)
      setBoardError('Could not create feedback item. Check database rules for /feedback.')
    }

    event.currentTarget.reset()
  }

  const votePollOption = async (pollId, optionId) => {
    if (votedPollIds.includes(pollId)) return
    if (!db || !currentUser?.uid) {
      setPolls((prev) =>
        prev.map((poll) => {
          if (poll.id !== pollId) return poll
          return {
            ...poll,
            options: poll.options.map((option) =>
              option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
            ),
          }
        }),
      )
      setVotedPollIds((prev) => [...prev, pollId])
      return
    }

    try {
      await runTransaction(ref(db, `feedback/polls/${pollId}`), (poll) => {
        if (!poll) return poll
        const next = { ...poll }
        const options = Array.isArray(next.options) ? [...next.options] : Object.values(next.options || {})
        const optionIndex = options.findIndex((o) => o?.id === optionId)
        if (optionIndex < 0) return poll
        const target = options[optionIndex]
        options[optionIndex] = { ...target, votes: Number(target?.votes || 0) + 1 }
        next.options = options
        return next
      })
      await set(ref(db, `feedback/votes/${currentUser.uid}/${pollId}`), optionId)
    } catch (err) {
      console.error(err)
      setBoardError('Could not submit vote. Check database rules for /feedback.')
    }
  }

  const addReply = async (threadId, messageOverride = null) => {
    const message = String(messageOverride ?? draftReplies[threadId] ?? '').trim()
    if (!message) return

    const reply = {
      id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author: currentUser?.name || 'Student',
      authorUid: currentUser?.uid || null,
      message,
      createdAt: Date.now(),
    }

    if (!db) {
      setRepliesByThread((prev) => ({ ...prev, [threadId]: [...(prev[threadId] || []), reply] }))
      setDraftReplies((prev) => ({ ...prev, [threadId]: '' }))
      return
    }

    try {
      await set(ref(db, `feedback/replies/${threadId}/${reply.id}`), reply)
      setDraftReplies((prev) => ({ ...prev, [threadId]: '' }))
    } catch (err) {
      console.error(err)
      setBoardError('Could not add reply. Check database rules for /feedback.')
    }
  }

  const markAsWorking = async (threadId) => {
    const quickText = `I can help with this item. — ${currentUser?.name || 'Student'}`
    await addReply(threadId, quickText)
  }

  return (
    <>
      <Header icon="🗳️" title="Feedback & Polls" subtitle="Share your thoughts and participate in campus polls" />
      <StatRow
        stats={[
          { icon: '📊', value: String(polls.length), label: 'Active Polls' },
          { icon: '🧩', value: String(feedbackThreads.length), label: 'Feedback Items' },
          { icon: '💬', value: String(totalReplies), label: 'Total Replies' },
          { icon: '✅', value: String(votedPollIds.length), label: 'Polls Participated', tone: 'ok' },
        ]}
      />
      {boardError ? (
        <p className="panel-error" role="alert">
          {boardError}
        </p>
      ) : null}

      <section className="grid-two">
        <article className="card panel">
          <h3>Campus Polls</h3>
          <div className="poll-list">
            {polls.map((poll) => (
              <button
                key={poll.id}
                type="button"
                className={`poll-tab ${selectedPollId === poll.id ? 'active' : ''}`}
                onClick={() => setSelectedPollId(poll.id)}
              >
                {poll.title}
              </button>
            ))}
          </div>

          {selectedPoll ? (
            <div className="poll-detail">
              <span className="tag">{selectedPoll.category}</span>
              <h4>{selectedPoll.question}</h4>
              <div className="poll-options">
                {selectedPoll.options.map((option) => {
                  const totalVotes = selectedPoll.options.reduce((sum, item) => sum + item.votes, 0) || 1
                  const percent = Math.round((option.votes / totalVotes) * 100)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className="poll-option"
                      disabled={votedPollIds.includes(selectedPoll.id)}
                      onClick={() => votePollOption(selectedPoll.id, option.id)}
                    >
                      <div className="poll-option-head">
                        <span>{option.label}</span>
                        <small>
                          {option.votes} votes ({percent}%)
                        </small>
                      </div>
                      <div className="poll-bar">
                        <div style={{ width: `${percent}%` }} />
                      </div>
                    </button>
                  )
                })}
              </div>
              {votedPollIds.includes(selectedPoll.id) ? (
                <small className="quiz-result-chip">Vote submitted</small>
              ) : null}
            </div>
          ) : null}
        </article>

        <article className="card panel">
          <h3>Admin Controls</h3>
          {isAdmin ? (
            <>
              <button type="button" onClick={() => setShowCreateForm((prev) => !prev)}>
                {showCreateForm ? 'Close Create Form' : 'Add Feedback Item'}
              </button>
              {showCreateForm ? (
                <form className="event-form" onSubmit={createFeedbackThread}>
                  <input name="title" placeholder="Title" required />
                  <input name="area" placeholder="Area (e.g. Events, Quizzes)" required />
                  <textarea name="message" rows="4" placeholder="What should users discuss/work on?" required />
                  <button type="submit">Create Item</button>
                </form>
              ) : null}
            </>
          ) : (
            <p className="muted">Only admin can add new feedback items. You can still reply and collaborate below.</p>
          )}
        </article>
      </section>

      <section className="card panel feedback-list-panel">
        <h3>Feedback Workboard</h3>
        {feedbackThreads.map((entry) => {
          const replies = repliesByThread[entry.id] || []
          return (
            <article key={entry.id} className="list-row">
              <div style={{ width: '100%' }}>
                <h4>{entry.title || entry.area}</h4>
                <p>{entry.message}</p>
                <small>
                  {entry.author} • {new Date(Number(entry.createdAt) || Date.now()).toLocaleDateString()} •{' '}
                  {entry.createdByAdmin ? 'Admin item' : 'User item'}
                </small>
                <div className="member-strip" style={{ marginTop: 8 }}>
                  <span className="tag">{entry.area}</span>
                  <small>{replies.length} replies</small>
                </div>
                <div style={{ marginTop: 10 }}>
                  {replies.map((reply) => (
                    <p key={reply.id} className="muted" style={{ margin: '4px 0' }}>
                      <strong>{reply.author}:</strong> {reply.message}
                    </p>
                  ))}
                </div>
                <div className="event-form" style={{ marginTop: 8 }}>
                  <textarea
                    rows="2"
                    placeholder="Reply to this item..."
                    value={draftReplies[entry.id] || ''}
                    onChange={(e) => setDraftReplies((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                  />
                  <div className="event-actions">
                    <button type="button" onClick={() => addReply(entry.id)}>
                      Reply
                    </button>
                    <button type="button" className="ghost-btn" onClick={() => markAsWorking(entry.id)}>
                      I can work on this
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </>
  )
}

export default FeedbackPage
