import { useEffect, useMemo, useState } from 'react'
import { onValue, ref } from 'firebase/database'
import Header from '../components/Header'
import StatRow from '../components/StatRow'
import { db } from '../lib/firebase'
import { normalizeLeaderboardName } from '../lib/leaderboardDisplay'

function LeaderboardPage({ currentUser }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!db) {
      setLoadError('Database is unavailable.')
      setLoading(false)
      return undefined
    }

    const usersRef = ref(db, 'users')
    const unsub = onValue(
      usersRef,
      (snap) => {
        const users = snap.exists() ? snap.val() : {}
        const builtRows = Object.entries(users)
          .map(([uid, value]) => {
            const profile = value?.profile || {}
            const stats = value?.stats || {}
            const points = Number(stats?.points || 0)
            const attendance = value?.schedule?.attendance || {}
            const classesAttended = Object.values(attendance).filter((entry) => entry?.attended === true).length
            const badgeCount = Math.min(6, Math.floor(points / 100))
            return {
              uid,
              name: normalizeLeaderboardName(profile?.name || profile?.email || 'Student', uid),
              points,
              streak: Number(stats?.streak || 0),
              badges: `${badgeCount}/6`,
              classesAttended,
            }
          })
          .sort((a, b) => b.points - a.points || b.classesAttended - a.classesAttended || a.name.localeCompare(b.name))

        setRows(builtRows)
        setLoadError('')
        setLoading(false)
      },
      () => {
        const fallback = currentUser
          ? [
              {
                uid: currentUser.uid,
                name: normalizeLeaderboardName(currentUser.name || currentUser.email || 'You', currentUser.uid),
                points: Number(currentUser.points || 0),
                streak: 0,
                badges: `${Math.min(6, Math.floor(Number(currentUser.points || 0) / 100))}/6`,
                classesAttended: 0,
              },
            ]
          : []
        setRows(fallback)
        setLoadError('Full leaderboard blocked by database rules. Allow signed-in users to read /users.')
        setLoading(false)
      },
    )

    return () => unsub()
  }, [currentUser])

  const stats = useMemo(() => {
    const activeStudents = rows.length
    const topScore = activeStudents ? Math.max(...rows.map((row) => row.points)) : 0
    const avgPoints = activeStudents ? Math.round(rows.reduce((sum, row) => sum + row.points, 0) / activeStudents) : 0
    return { activeStudents, topScore, avgPoints }
  }, [rows])

  return (
    <>
      <Header icon="🏅" title="Leaderboard" subtitle="Compete with fellow students and climb the ranks" />
      <StatRow
        stats={[
          { icon: '🏅', value: String(stats.activeStudents), label: 'Active Students' },
          { icon: '🥇', value: String(stats.topScore), label: 'Top Score' },
          { icon: '📈', value: String(stats.avgPoints), label: 'Average Points', tone: 'ok' },
        ]}
      />
      {loadError ? <p className="muted">{loadError}</p> : null}
      <section className="card panel">
        {loading ? <p className="muted">Loading leaderboard…</p> : null}
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Points</th>
              <th>Streak</th>
              <th>Badges</th>
              <th>Classes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.uid}>
                <td>#{index + 1}</td>
                <td>{row.name}</td>
                <td>{row.points}</td>
                <td>{row.streak}</td>
                <td>{row.badges}</td>
                <td>{row.classesAttended}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

export default LeaderboardPage
