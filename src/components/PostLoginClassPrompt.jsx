import { useEffect, useMemo, useRef, useState } from 'react'
import { useUserSchedule } from '../hooks/useUserSchedule'
import { findTodayUnloggedPastClass, minutesToLabel } from '../lib/scheduleUtils'

const ATTEND_POINTS = 5

/**
 * After login, asks once per session about a **today** class that has ended but is not logged yet.
 * No prompts for classes on other days.
 */
function PostLoginClassPrompt({ currentUser, awardPoints }) {
  const uid = currentUser?.uid
  const { classList, attendanceMap, recordAttendance } = useUserSchedule(uid)
  const suppressForSession = useRef(false)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    suppressForSession.current = false
  }, [uid])

  const pending = useMemo(
    () => findTodayUnloggedPastClass(classList, attendanceMap, new Date()),
    [classList, attendanceMap],
  )

  useEffect(() => {
    if (!pending) {
      setOpen(false)
      return
    }
    if (suppressForSession.current) return
    setOpen(true)
  }, [pending])

  const closeForSession = () => {
    suppressForSession.current = true
    setOpen(false)
  }

  const handleAnswer = async (attended) => {
    if (!pending || busy) return
    setBusy(true)
    try {
      const { cls, dateKey } = pending
      let pointsAwarded = 0
      if (attended) {
        const ok = await awardPoints?.({
          amount: ATTEND_POINTS,
          actionKey: `class-attend-${cls.id}-${dateKey}`,
          category: 'classes',
          label: cls.title || 'Class attendance',
        })
        if (ok) pointsAwarded = ATTEND_POINTS
      }
      await recordAttendance({
        classId: cls.id,
        dateKey,
        attended,
        pointsAwarded,
      })
      closeForSession()
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') closeForSession()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open || !pending) return null

  const { cls } = pending

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && closeForSession()}>
      <div
        className="card panel class-login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-login-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="class-login-modal-title">Class today — did you go?</h3>
        <p className="class-login-modal__lead">
          You have <strong>{cls.title}</strong> on your timetable today
          {cls.location ? ` (${cls.location})` : ''},{' '}
          <span className="muted">
            {minutesToLabel(cls.startMinutes)} – {minutesToLabel(cls.endMinutes)}
          </span>
          . Were you there?
        </p>
        <div className="class-login-modal__actions">
          <button type="button" disabled={busy} onClick={() => handleAnswer(true)}>
            {busy ? 'Saving…' : `Yes, I was there (+${ATTEND_POINTS} pts)`}
          </button>
          <button type="button" className="secondary" disabled={busy} onClick={() => handleAnswer(false)}>
            No, I missed it
          </button>
        </div>
        <button type="button" className="class-login-modal__later ghost-btn" disabled={busy} onClick={closeForSession}>
          Ask me later
        </button>
      </div>
    </div>
  )
}

export default PostLoginClassPrompt
