import { useMemo, useState } from 'react'
import Header from '../components/Header'
import StatRow from '../components/StatRow'
import { useUserSchedule } from '../hooks/useUserSchedule'
import {
  attendanceCountsInRange,
  canLogAttendanceForClass,
  formatCompactTodayLine,
  isoWeekRangeKeys,
  logIdFor,
  minutesToLabel,
  newClassId,
  normalizeImportedRows,
  todayDateKey,
} from '../lib/scheduleUtils'

const ATTEND_POINTS = 5

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

function ClassesPage({ currentUser, awardPoints }) {
  const uid = currentUser?.uid
  const {
    classList,
    attendanceMap,
    timetableDataUrl,
    loadError,
    stats,
    saveTimetableImage,
    upsertClasses,
    removeClass,
    recordAttendance,
    getTodaysClasses,
  } = useUserSchedule(uid)

  const [toast, setToast] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const [form, setForm] = useState({
    title: '',
    dayOfWeek: 1,
    start: '09:00',
    end: '10:30',
    location: '',
  })

  const now = new Date()
  const dateKey = todayDateKey(now)
  const weekKeys = useMemo(() => isoWeekRangeKeys(now), [dateKey])
  const weekAttendance = useMemo(
    () => attendanceCountsInRange(attendanceMap, weekKeys.start, weekKeys.end),
    [attendanceMap, weekKeys.start, weekKeys.end],
  )
  const todays = useMemo(() => getTodaysClasses(new Date()), [getTodaysClasses, dateKey])

  const showToast = (message, tone = 'ok') => {
    setToast({ message, tone })
    window.setTimeout(() => setToast(null), 4200)
  }

  const handleTimetableImage = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file (PNG or JPG).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Image should be under 2 MB for browser storage.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        saveTimetableImage(reader.result)
        setPhotoError('')
        showToast('Timetable photo saved. Add your class times below so we can remind you.')
      } catch (err) {
        setPhotoError(err?.message || 'Could not save image.')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddClass = async (e) => {
    e.preventDefault()
    const normalized = normalizeImportedRows([
      {
        title: form.title,
        day: form.dayOfWeek,
        start: form.start,
        end: form.end,
        location: form.location,
      },
    ])
    if (!normalized.length) {
      setPhotoError('Check the time format (e.g. 9:00 AM or 14:30).')
      return
    }
    const row = { ...normalized[0], id: newClassId() }
    await upsertClasses([row])
    setForm((f) => ({ ...f, title: '', location: '' }))
    setPhotoError('')
    showToast('Class added to your schedule.')
  }

  const handleAttendance = async (cls, attended) => {
    const lid = logIdFor(dateKey, cls.id)
    if (attendanceMap[lid]) return

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

    if (attended) {
      showToast(
        pointsAwarded
          ? `Nice — you earned ${ATTEND_POINTS} points for showing up.`
          : 'Logged as attended. (Points were already counted for this slot.)',
      )
    } else {
      showToast(
        'Logged as missed — review notes or slides when you can so you do not fall behind.',
        'warn',
      )
    }
  }

  return (
    <>
      <Header
        icon="📚"
        title="Classes & attendance"
        subtitle="Upload your timetable, log each class, and earn points for showing up"
      />

      <div className="classes-page-top card">
        <p className="classes-meta-strip">{formatCompactTodayLine(now)}</p>
        <div className="classes-attendance-rail" role="status">
          <span className="classes-attendance-rail__label">Attendance</span>
          <span className="classes-attendance-rail__stats">
            This week:{' '}
            <strong>
              {weekAttendance.attended} attended
              {weekAttendance.missed ? ` · ${weekAttendance.missed} missed` : ''}
            </strong>
            <span className="classes-attendance-rail__dot"> · </span>
            All time: <strong>{stats.attended} attended</strong>
            {stats.missed ? ` · ${stats.missed} missed` : ''} ·{' '}
            <strong>{stats.pointsFromAttendance} pts</strong> from showing up
          </span>
        </div>
      </div>

      {toast ? (
        <div className={`card panel attendance-toast attendance-toast--${toast.tone}`} role="status">
          {toast.message}
        </div>
      ) : null}

      <StatRow
        stats={[
          { icon: '✅', value: String(stats.attended), label: 'Attended (logged)', tone: 'ok' },
          { icon: '⏭️', value: String(stats.missed), label: 'Missed (logged)' },
          { icon: '📋', value: String(stats.weekScheduled), label: 'Slots this week' },
          {
            icon: '✨',
            value: String(stats.pointsFromAttendance),
            label: 'Points from attendance',
            tone: 'ok',
          },
        ]}
      />

      <section className="card panel">
        <h3>Timetable photo</h3>
        <p className="muted small">
          Upload a picture of your timetable if you like. Your weekly schedule and check-ins use the classes you add.
        </p>
        {timetableDataUrl ? (
          <div className="timetable-preview-wrap">
            <img src={timetableDataUrl} alt="Your timetable" className="timetable-preview" />
            <button type="button" className="secondary narrow" onClick={() => saveTimetableImage(null)}>
              Remove photo
            </button>
          </div>
        ) : (
          <label className="file-upload-label">
            <span>Choose image</span>
            <input type="file" accept="image/*" onChange={handleTimetableImage} />
          </label>
        )}
      </section>

      {loadError ? (
        <p className="panel-error" role="alert">
          {loadError}
        </p>
      ) : null}
      {photoError ? (
        <p className="panel-error" role="alert">
          {photoError}
        </p>
      ) : null}

      <section className="card panel">
        <h3>Your weekly schedule</h3>
        {classList.length === 0 ? (
          <p className="muted">No classes yet. Add one from the section below.</p>
        ) : (
          <ul className="list">
            {classList
              .slice()
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startMinutes - b.startMinutes)
              .map((cls) => (
                <li key={cls.id} className="list-row">
                  <div>
                    <h4>{cls.title}</h4>
                    <p>
                      {DAYS.find((d) => d.value === cls.dayOfWeek)?.label} · {minutesToLabel(cls.startMinutes)} –{' '}
                      {minutesToLabel(cls.endMinutes)}
                      {cls.location ? ` · ${cls.location}` : ''}
                    </p>
                  </div>
                  <button type="button" className="secondary narrow" onClick={() => removeClass(cls.id)}>
                    Remove
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <details className="card panel classes-add-disclosure">
        <summary className="classes-add-disclosure__summary">
          <span className="classes-add-disclosure__chev" aria-hidden />
          <span className="classes-add-disclosure__title">Add a class manually</span>
          <span className="classes-add-disclosure__hint">Tap to expand the form</span>
        </summary>
        <div className="classes-add-disclosure__body">
          <form className="class-form" onSubmit={handleAddClass}>
            <label>
              Course / title
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Data Structures"
                required
              />
            </label>
            <label>
              Day
              <select value={form.dayOfWeek} onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}>
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Start
              <input value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} required />
            </label>
            <label>
              End
              <input value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} required />
            </label>
            <label className="span-2">
              Room (optional)
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Lab 2"
              />
            </label>
            <button type="submit" className="span-2">
              Add to schedule
            </button>
          </form>
        </div>
      </details>

      <section className="card panel">
        <h3>Today — were you there?</h3>
        {classList.length === 0 ? (
          <p className="muted">Open &quot;Add a class manually&quot; above to add classes and check in here.</p>
        ) : todays.length === 0 ? (
          <p className="muted">No classes scheduled for today.</p>
        ) : (
          <ul className="list class-check-list">
            {todays.map((cls) => {
              const lid = logIdFor(dateKey, cls.id)
              const logged = attendanceMap[lid]
              const canLog = canLogAttendanceForClass(cls, new Date())
              return (
                <li key={cls.id} className="list-row class-check-row">
                  <div>
                    <h4>{cls.title}</h4>
                    <p>
                      {minutesToLabel(cls.startMinutes)} – {minutesToLabel(cls.endMinutes)}
                      {cls.location ? ` · ${cls.location}` : ''}
                    </p>
                  </div>
                  <div className="class-check-actions">
                    {!canLog && !logged ? (
                      <span className="muted small">Check in after start time</span>
                    ) : null}
                    {logged ? (
                      <span className={logged.attended ? 'tag tag--ok' : 'tag tag--miss'}>
                        {logged.attended ? 'Attended' : 'Missed'}
                      </span>
                    ) : canLog ? (
                      <div className="button-grid inline">
                        <button type="button" onClick={() => handleAttendance(cls, true)}>
                          I was there (+{ATTEND_POINTS} pts)
                        </button>
                        <button type="button" className="secondary" onClick={() => handleAttendance(cls, false)}>
                          I missed it
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}

export default ClassesPage
