import { useMemo, useState } from 'react'
import Header from '../components/Header'
import StatRow from '../components/StatRow'

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

const initialFeedback = [
  {
    id: 'f1',
    author: 'Emma Wilson',
    area: 'Events',
    message: 'Loved the AI career session. Please share speaker slides afterward.',
    rating: 5,
    date: 'Mar 22',
  },
  {
    id: 'f2',
    author: 'Sarah Johnson',
    area: 'Study Groups',
    message: 'Group reminders are useful; add calendar sync for weekly sessions.',
    rating: 4,
    date: 'Mar 23',
  },
]

function FeedbackPage() {
  const [polls, setPolls] = useState(initialPolls)
  const [feedbackEntries, setFeedbackEntries] = useState(initialFeedback)
  const [selectedPollId, setSelectedPollId] = useState(initialPolls[0].id)
  const [votedPollIds, setVotedPollIds] = useState([])

  const selectedPoll = polls.find((poll) => poll.id === selectedPollId) || null

  const averageRating = useMemo(() => {
    if (!feedbackEntries.length) return 0
    return (
      feedbackEntries.reduce((sum, item) => sum + item.rating, 0) /
      feedbackEntries.length
    ).toFixed(1)
  }, [feedbackEntries])

  const submitFeedback = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const area = String(formData.get('area') || '').trim()
    const message = String(formData.get('message') || '').trim()
    const rating = Number(formData.get('rating') || 0)

    if (!area || !message || !rating) return

    const newEntry = {
      id: `f-${Date.now()}`,
      author: 'You',
      area,
      message,
      rating,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    }

    setFeedbackEntries((prev) => [newEntry, ...prev])
    event.currentTarget.reset()
  }

  const votePollOption = (pollId, optionId) => {
    if (votedPollIds.includes(pollId)) return
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
  }

  return (
    <>
      <Header icon="🗳️" title="Feedback & Polls" subtitle="Share your thoughts and participate in campus polls" />
      <StatRow
        stats={[
          { icon: '📊', value: String(polls.length), label: 'Active Polls' },
          { icon: '💬', value: String(feedbackEntries.length), label: 'Total Feedback' },
          { icon: '✅', value: String(votedPollIds.length), label: 'Polls Participated', tone: 'ok' },
          { icon: '⭐', value: String(averageRating), label: 'Avg Rating' },
        ]}
      />

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
          <h3>Submit Feedback</h3>
          <form className="event-form" onSubmit={submitFeedback}>
            <input name="area" placeholder="Area (e.g. Events, Quizzes)" required />
            <textarea name="message" rows="4" placeholder="Share your feedback..." required />
            <input name="rating" type="number" min="1" max="5" placeholder="Rating (1-5)" required />
            <button type="submit">Submit Feedback</button>
          </form>
        </article>
      </section>

      <section className="card panel feedback-list-panel">
        <h3>Recent Feedback</h3>
        {feedbackEntries.map((entry) => (
          <article key={entry.id} className="list-row">
            <div>
              <h4>{entry.area}</h4>
              <p>{entry.message}</p>
              <small>
                {entry.author} • {entry.date}
              </small>
            </div>
            <div className="row-meta">
              <span>{'⭐'.repeat(entry.rating)}</span>
              <small>{entry.rating}/5</small>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}

export default FeedbackPage
