import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import StatRow from '../components/StatRow'
import {
  canCompleteScheduled,
  canJoinScheduled,
  formatCountdown,
  formatWindowLabel,
  getChallengePhase,
} from '../lib/challengeSchedule'

function buildInitialChallenges() {
  const t = Date.now()
  return [
    {
      id: 'ch1',
      kind: 'instant',
      title: 'Early Bird',
      description: 'Attend a class before 9 AM',
      points: 15,
      status: 'available',
    },
    {
      id: 'ch2',
      kind: 'instant',
      title: 'Social Butterfly',
      description: 'Meet 3 new students today',
      points: 10,
      status: 'available',
    },
    {
      id: 'ch3',
      kind: 'instant',
      title: 'Library Lover',
      description: 'Spend 1 hour in the library',
      points: 10,
      status: 'expired',
    },
    {
      kind: 'scheduled',
      id: 'sch-live',
      title: 'Lunch & learn (live window)',
      description: 'Join during the open window, then mark complete before it closes.',
      points: 15,
      startsAt: t - 60 * 1000,
      endsAt: t + 50 * 60 * 1000,
      status: 'available',
    },
    {
      kind: 'scheduled',
      id: 'sch-soon',
      title: 'Flash study hall',
      description: 'Opens in a few minutes — join when the timer hits zero.',
      points: 18,
      startsAt: t + 3 * 60 * 1000,
      endsAt: t + 48 * 60 * 1000,
      status: 'available',
    },
    {
      kind: 'scheduled',
      id: 'sch-evening',
      title: 'Evening coding sprint',
      description: 'Later today — plan to join when it unlocks.',
      points: 25,
      startsAt: t + 22 * 60 * 1000,
      endsAt: t + 2 * 60 * 60 * 1000,
      status: 'available',
    },
  ]
}

function ChallengesPage({ onChallengeCompleted, awardedActionKeys = [] }) {
  const [now, setNow] = useState(() => Date.now())
  const [challenges, setChallenges] = useState(buildInitialChallenges)
  const [pendingChallengeId, setPendingChallengeId] = useState(null)

  useEffect(() => {
    const tick = () => {
      const n = Date.now()
      setNow(n)
      setChallenges((prev) =>
        prev.map((ch) => {
          if (ch.kind !== 'scheduled' || ch.status === 'completed') return ch
          if (ch.endsAt && n > ch.endsAt && ch.status !== 'completed') {
            return { ...ch, status: 'expired' }
          }
          return ch
        }),
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const completedFromAwards = useMemo(
    () =>
      new Set(
        awardedActionKeys
          .filter((key) => key.startsWith('challenge-complete-'))
          .map((key) => key.slice('challenge-complete-'.length)),
      ),
    [awardedActionKeys],
  )

  useEffect(() => {
    if (!completedFromAwards.size) return
    setChallenges((prev) =>
      prev.map((item) =>
        completedFromAwards.has(item.id) && item.status !== 'expired' ? { ...item, status: 'completed' } : item,
      ),
    )
  }, [completedFromAwards])

  const stats = useMemo(() => {
    const joined = challenges.filter((item) => item.status === 'joined').length
    const completed = challenges.filter((item) => item.status === 'completed').length
    const active = challenges.filter((item) => item.status === 'available' || item.status === 'joined').length
    const totalPoints = challenges.reduce((sum, item) => sum + item.points, 0)

    return { joined, completed, active, totalPoints }
  }, [challenges])

  const joinChallenge = (challengeId) => {
    const ch = challenges.find((c) => c.id === challengeId)
    if (!ch) return
    if (ch.kind === 'scheduled' && !canJoinScheduled(ch, now)) return
    setChallenges((prev) =>
      prev.map((item) => (item.id === challengeId && item.status === 'available' ? { ...item, status: 'joined' } : item)),
    )
  }

  const completeChallenge = async (challengeId) => {
    if (pendingChallengeId) return
    if (completedFromAwards.has(challengeId)) {
      setChallenges((prev) =>
        prev.map((item) => (item.id === challengeId && item.status !== 'expired' ? { ...item, status: 'completed' } : item)),
      )
      return
    }

    const target = challenges.find((item) => item.id === challengeId)
    if (!target || target.status !== 'joined') return
    if (!canCompleteScheduled(target, now)) return

    setPendingChallengeId(challengeId)
    setChallenges((prev) => prev.map((item) => (item.id === challengeId ? { ...item, status: 'completed' } : item)))

    try {
      if (onChallengeCompleted) {
        const awarded = await onChallengeCompleted(target)
        if (!awarded) {
          setChallenges((prev) => prev.map((item) => (item.id === challengeId ? { ...item, status: 'joined' } : item)))
        }
      }
    } finally {
      setPendingChallengeId(null)
    }
  }

  const leaveChallenge = (challengeId) => {
    setChallenges((prev) =>
      prev.map((item) =>
        item.id === challengeId && item.status === 'joined' && !completedFromAwards.has(item.id)
          ? { ...item, status: 'available' }
          : item,
      ),
    )
  }

  const statusLabel = (challenge, phase) => {
    if (phase === 'completed' || challenge.status === 'completed') return 'Completed'
    if (phase === 'expired' || challenge.status === 'expired') return 'Expired'
    if (phase === 'upcoming') return 'Opens soon'
    if (challenge.status === 'joined') return 'Joined'
    return 'Available'
  }

  return (
    <>
      <Header
        icon="🎯"
        title="Daily Challenges"
        subtitle="Instant tasks plus timed windows — join when open, then mark complete"
      />
      <StatRow
        stats={[
          { icon: '🎯', value: String(stats.active), label: 'Active Challenges' },
          { icon: '🙋', value: String(stats.joined), label: 'Joined' },
          { icon: '✅', value: String(stats.completed), label: 'Completed', tone: 'ok' },
          { icon: '🏆', value: String(stats.totalPoints), label: 'Total Points Available' },
        ]}
      />
      <section className="card panel">
        {challenges.map((challenge) => {
          const phase = getChallengePhase(challenge, now)
          const scheduled = challenge.kind === 'scheduled'
          const joinOk = !scheduled || canJoinScheduled(challenge, now)
          const completeOk = !scheduled || canCompleteScheduled(challenge, now)
          const showJoin =
            challenge.status === 'available' && !completedFromAwards.has(challenge.id) && phase !== 'expired' && joinOk
          const showJoinDisabled =
            challenge.status === 'available' && scheduled && phase === 'upcoming' && !completedFromAwards.has(challenge.id)

          return (
            <article key={challenge.id} className={`list-row${scheduled ? ' challenge-scheduled' : ''}`}>
              <div>
                <h4>
                  {challenge.title}
                  {scheduled ? (
                    <span className="tag tag-inline" title="Timed window">
                      Timed
                    </span>
                  ) : null}
                </h4>
                <p>{challenge.description}</p>
                {scheduled ? (
                  <p className="muted challenge-window">
                    <strong>Window:</strong> {formatWindowLabel(challenge.startsAt, challenge.endsAt)}
                    {phase === 'upcoming' ? (
                      <>
                        {' '}
                        · <strong>Opens in</strong> {formatCountdown(challenge.startsAt - now)}
                      </>
                    ) : null}
                    {phase !== 'upcoming' && phase !== 'expired' && challenge.endsAt && now < challenge.endsAt ? (
                      <>
                        {' '}
                        · <strong>Closes in</strong> {formatCountdown(challenge.endsAt - now)}
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
              <div className="row-meta">
                <span>{challenge.points} pts</span>
                <small>{statusLabel(challenge, phase)}</small>
                {showJoin ? (
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => joinChallenge(challenge.id)}
                    disabled={Boolean(pendingChallengeId)}
                  >
                    Join
                  </button>
                ) : null}
                {showJoinDisabled ? (
                  <button type="button" className="ghost-btn" disabled title="Wait until the window opens">
                    Opens in {formatCountdown(challenge.startsAt - now)}
                  </button>
                ) : null}
                {challenge.status === 'joined' && phase !== 'expired' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => completeChallenge(challenge.id)}
                      disabled={pendingChallengeId === challenge.id || !completeOk}
                      title={!completeOk ? 'Outside the challenge window' : undefined}
                    >
                      {pendingChallengeId === challenge.id ? 'Saving…' : 'Mark Completed'}
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => leaveChallenge(challenge.id)}
                      disabled={Boolean(pendingChallengeId)}
                    >
                      Leave
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          )
        })}
      </section>
    </>
  )
}

export default ChallengesPage
