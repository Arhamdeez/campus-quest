import { useMemo, useState } from 'react'
import Header from '../components/Header'
import StatRow from '../components/StatRow'

const initialChallenges = [
  {
    id: 'ch1',
    title: 'Early Bird',
    description: 'Attend a class before 9 AM',
    points: 15,
    status: 'available',
  },
  {
    id: 'ch2',
    title: 'Social Butterfly',
    description: 'Meet 3 new students today',
    points: 10,
    status: 'available',
  },
  {
    id: 'ch3',
    title: 'Library Lover',
    description: 'Spend 1 hour in the library',
    points: 12,
    status: 'expired',
  },
]

function ChallengesPage({ onChallengeCompleted }) {
  const [challenges, setChallenges] = useState(initialChallenges)

  const stats = useMemo(() => {
    const joined = challenges.filter((item) => item.status === 'joined').length
    const completed = challenges.filter((item) => item.status === 'completed').length
    const active = challenges.filter((item) => item.status === 'available' || item.status === 'joined').length
    const totalPoints = challenges.reduce((sum, item) => sum + item.points, 0)

    return { joined, completed, active, totalPoints }
  }, [challenges])

  const joinChallenge = (challengeId) => {
    setChallenges((prev) =>
      prev.map((item) => (item.id === challengeId && item.status === 'available' ? { ...item, status: 'joined' } : item)),
    )
  }

  const completeChallenge = (challengeId) => {
    let completedChallenge = null
    setChallenges((prev) =>
      prev.map((item) => {
        if (item.id === challengeId && item.status === 'joined') {
          completedChallenge = item
          return { ...item, status: 'completed' }
        }
        return item
      }),
    )
    if (completedChallenge && onChallengeCompleted) onChallengeCompleted(completedChallenge)
  }

  const leaveChallenge = (challengeId) => {
    setChallenges((prev) =>
      prev.map((item) => (item.id === challengeId && item.status === 'joined' ? { ...item, status: 'available' } : item)),
    )
  }

  const statusLabel = (status) => {
    if (status === 'completed') return 'Completed'
    if (status === 'joined') return 'Joined'
    if (status === 'expired') return 'Expired'
    return 'Available'
  }

  return (
    <>
      <Header icon="🎯" title="Daily Challenges" subtitle="Complete challenges to earn bonus points" />
      <StatRow
        stats={[
          { icon: '🎯', value: String(stats.active), label: 'Active Challenges' },
          { icon: '🙋', value: String(stats.joined), label: 'Joined' },
          { icon: '✅', value: String(stats.completed), label: 'Completed', tone: 'ok' },
          { icon: '🏆', value: String(stats.totalPoints), label: 'Total Points Available' },
        ]}
      />
      <section className="card panel">
        {challenges.map((challenge) => (
          <article key={challenge.id} className="list-row">
            <div>
              <h4>{challenge.title}</h4>
              <p>{challenge.description}</p>
            </div>
            <div className="row-meta">
              <span>{challenge.points} pts</span>
              <small>{statusLabel(challenge.status)}</small>
              {challenge.status === 'available' ? (
                <button type="button" className="ghost-btn" onClick={() => joinChallenge(challenge.id)}>
                  Join
                </button>
              ) : null}
              {challenge.status === 'joined' ? (
                <>
                  <button type="button" onClick={() => completeChallenge(challenge.id)}>
                    Mark Completed
                  </button>
                  <button type="button" className="ghost-btn" onClick={() => leaveChallenge(challenge.id)}>
                    Leave
                  </button>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </>
  )
}

export default ChallengesPage
