import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { quizCatalog } from '../data/mockData'

function QuizAttemptPage({ onQuizCompleted }) {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const quiz = quizCatalog.find((item) => item.id === quizId)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const resultSavedRef = useRef(false)
  const answeredCount = Object.keys(answers).length
  const progressPercent = quiz ? Math.round((answeredCount / quiz.questions.length) * 100) : 0

  const result = useMemo(() => {
    if (!submitted || !quiz) return null
    let correctCount = 0
    const topicStats = {}

    quiz.questions.forEach((question) => {
      const selectedIndex = answers[question.id]
      const isCorrect = selectedIndex === question.correctIndex
      if (isCorrect) correctCount += 1

      if (!topicStats[question.topic]) {
        topicStats[question.topic] = { correct: 0, total: 0 }
      }
      topicStats[question.topic].total += 1
      if (isCorrect) topicStats[question.topic].correct += 1
    })

    const totalQuestions = quiz.questions.length
    const accuracy = totalQuestions ? correctCount / totalQuestions : 0
    const earnedPoints = Math.round((quiz.points * correctCount) / totalQuestions)

    const weakTopics = Object.entries(topicStats)
      .filter(([, value]) => value.correct / value.total < 0.6)
      .map(([topic]) => topic)

    const strongTopics = Object.entries(topicStats)
      .filter(([, value]) => value.correct / value.total >= 0.8)
      .map(([topic]) => topic)

    return { correctCount, totalQuestions, accuracy, earnedPoints, weakTopics, strongTopics, topicStats }
  }, [answers, quiz, submitted])

  const isQuizMissing = !quiz

  const handleSubmit = (event) => {
    event.preventDefault()
    if (submitted) return
    setSubmitted(true)
  }

  useEffect(() => {
    if (!submitted || !result || resultSavedRef.current) return
    resultSavedRef.current = true
    onQuizCompleted?.({
      id: quiz.id,
      earnedPoints: result.earnedPoints,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      topicStats: result.topicStats,
      submittedAt: new Date().toISOString(),
    })
  }, [onQuizCompleted, quiz?.id, result, submitted])

  useEffect(() => {
    // Reset for a new attempt/quiz.
    resultSavedRef.current = false
  }, [quiz?.id])

  const handleAnswer = (questionId, optionIndex) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  if (isQuizMissing) {
    return (
      <section className="card panel">
        <h3>Quiz not found</h3>
        <button type="button" className="ghost-btn" onClick={() => navigate('/quizzes')}>
          Back to Quizzes
        </button>
      </section>
    )
  }

  return (
    <>
      <Header icon="📝" title={quiz.title} subtitle={`${quiz.duration} • ${quiz.points} max points`} />
      <section className="card panel">
        <div className="quiz-meta-row">
          <span>{quiz.questions.length} questions</span>
          <span>{answeredCount} answered</span>
          <span>{progressPercent}% progress</span>
        </div>
        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <form className="quiz-form" onSubmit={handleSubmit}>
          {quiz.questions.map((question, index) => (
            <article key={question.id} className="quiz-question">
              <div className="quiz-question-head">
                <h4>
                  Q{index + 1}. {question.question}
                </h4>
                <span className="tag">{question.topic}</span>
              </div>
              <div className="quiz-options">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={`${question.id}-${option}`}
                    className={`quiz-option ${
                      answers[question.id] === optionIndex ? 'selected' : ''
                    } ${
                      submitted && optionIndex === question.correctIndex
                        ? 'correct'
                        : submitted &&
                            answers[question.id] === optionIndex &&
                            optionIndex !== question.correctIndex
                          ? 'wrong'
                          : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => handleAnswer(question.id, optionIndex)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {submitted ? (
                <p className="quiz-explanation">
                  Correct: {question.options[question.correctIndex]} — {question.explanation}
                </p>
              ) : null}
            </article>
          ))}

          {!submitted ? (
            <button type="submit" disabled={Object.keys(answers).length !== quiz.questions.length}>
              Submit Answers
            </button>
          ) : null}
        </form>
      </section>

      {submitted && result ? (
        <section className="card panel quiz-feedback">
          <h3>Performance Feedback</h3>
          <p className="quiz-highlight">
            You scored <strong>{result.correctCount}</strong> out of <strong>{result.totalQuestions}</strong> and earned{' '}
            <strong>{result.earnedPoints}</strong> points.
          </p>
          <p>
            Accuracy: <strong>{Math.round(result.accuracy * 100)}%</strong>{' '}
            {result.accuracy >= 0.8 ? 'Excellent work.' : result.accuracy >= 0.6 ? 'Good effort, keep improving.' : 'Needs more practice.'}
          </p>
          <p>
            <strong>Strong sections:</strong> {result.strongTopics.length ? result.strongTopics.join(', ') : 'None yet'}
          </p>
          <p>
            <strong>Focus more on:</strong> {result.weakTopics.length ? result.weakTopics.join(', ') : 'Great balance across sections'}
          </p>
          <div className="event-actions">
            <button type="button" className="ghost-btn" onClick={() => navigate('/quizzes')}>
              Back to Quizzes
            </button>
          </div>
        </section>
      ) : null}
    </>
  )
}

export default QuizAttemptPage
