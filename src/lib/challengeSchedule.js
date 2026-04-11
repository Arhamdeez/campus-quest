/** Phase for a challenge row given current time (client clock). */
export function getChallengePhase(challenge, now) {
  if (challenge.status === 'completed') return 'completed'
  if (challenge.kind === 'scheduled') {
    if (now < challenge.startsAt) return 'upcoming'
    if (challenge.endsAt && now > challenge.endsAt) return 'expired'
  }
  if (challenge.status === 'expired') return 'expired'
  return challenge.status
}

export function canJoinScheduled(challenge, now) {
  if (challenge.kind !== 'scheduled') return true
  return now >= challenge.startsAt && (!challenge.endsAt || now <= challenge.endsAt)
}

export function canCompleteScheduled(challenge, now) {
  if (challenge.kind !== 'scheduled') return true
  if (now < challenge.startsAt) return false
  if (challenge.endsAt && now > challenge.endsAt) return false
  return true
}

export function formatCountdown(ms) {
  if (ms <= 0) return '0s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ${h % 24}h`
  if (h > 0) return `${h}h ${m % 60}m`
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

export function formatWindowLabel(startsAt, endsAt) {
  const start = new Date(startsAt)
  const end = endsAt ? new Date(endsAt) : null
  const opts = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
  if (!end) return `Starts ${start.toLocaleString(undefined, opts)}`
  return `${start.toLocaleString(undefined, opts)} → ${end.toLocaleString(undefined, opts)}`
}
