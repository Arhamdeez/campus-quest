import Header from '../components/Header'
import StatRow from '../components/StatRow'
import { leaderboard } from '../data/mockData'

function LeaderboardPage() {
  return (
    <>
      <Header icon="🏅" title="Leaderboard" subtitle="Compete with fellow students and climb the ranks" />
      <StatRow
        stats={[
          { icon: '🏅', value: '4', label: 'Active Students' },
          { icon: '🥇', value: '312', label: 'Top Score' },
          { icon: '📈', value: '189', label: 'Average Points', tone: 'ok' },
        ]}
      />
      <section className="card panel">
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
            {leaderboard.map((row, index) => (
              <tr key={row[0]}>
                <td>#{index + 1}</td>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

export default LeaderboardPage
