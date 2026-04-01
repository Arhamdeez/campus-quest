import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StatRow from '../components/StatRow'
import { quizCatalog } from '../data/mockData'

function QuizzesPage({ quizResults }) {
  const navigate = useNavigate()
  const completed = useMemo(() => Object.keys(quizResults || {}).length, [quizResults])
  const score = useMemo(
    () => Object.values(quizResults || {}).reduce((sum, result) => sum + (result.earnedPoints || 0), 0),
    [quizResults],
  )

  return (
    <>
      <Header icon="🧠" title="Learning Quizzes" subtitle="Test your knowledge and earn points" />
      <StatRow
        stats={[
          { icon: '🧠', value: String(quizCatalog.length), label: 'Total Quizzes' },
          { icon: '✅', value: String(completed), label: 'Completed', tone: 'ok' },
          { icon: '🏆', value: String(score), label: 'Total Score' },
        ]}
      />
      <section className="grid-two">
        {quizCatalog.map((q) => (
          <article key={q.id} className="card panel quiz-card">
            <h4>{q.title}</h4>
            <p>{q.description}</p>
            <div className="quiz-card-meta">
              <small>
                {q.points} pts • {q.duration} • {q.questions.length} questions
              </small>
            </div>
            <div className="quiz-card-footer">
              {quizResults?.[q.id] ? (
                <span className="quiz-result-chip">
                  Last score: {quizResults[q.id].correctCount}/{quizResults[q.id].totalQuestions}
                </span>
              ) : null}
              <button type="button" onClick={() => navigate(`/quizzes/${q.id}`)}>
                {quizResults?.[q.id] ? 'Retake Quiz' : 'Start Quiz'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}

export default QuizzesPage
