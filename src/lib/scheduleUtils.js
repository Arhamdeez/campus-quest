const DAY_NAMES = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

export function parseDayOfWeek(input) {
  if (input == null || input === '') return null
  if (typeof input === 'number' && Number.isInteger(input) && input >= 0 && input <= 6) return input
  const s = String(input).trim().toLowerCase()
  if (s in DAY_NAMES) return DAY_NAMES[s]
  const n = parseInt(s, 10)
  if (!Number.isNaN(n) && n >= 0 && n <= 6) return n
  return null
}

/** "9:00", "09:00", "9:00 AM", "14:30" → minutes from midnight */
export function parseTimeToMinutes(str) {
  if (str == null || str === '') return null
  const raw = String(str).trim().toUpperCase()
  const ampm = raw.includes('PM') ? 'PM' : raw.includes('AM') ? 'AM' : null
  const cleaned = raw.replace(/\s*(AM|PM)\s*/i, '').trim()
  const parts = cleaned.split(':')
  if (parts.length < 2) return null
  let h = parseInt(parts[0], 10)
  let m = parseInt(parts[1], 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  return h * 60 + m
}

export function minutesToLabel(total) {
  const h = Math.floor(total / 60)
  const m = total % 60
  const am = h < 12
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${am ? 'AM' : 'PM'}`
}

export function newClassId() {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function classesObjectToList(obj) {
  if (!obj || typeof obj !== 'object') return []
  return Object.entries(obj).map(([id, v]) => ({ id, ...v }))
}

export function todayDateKey(d = new Date()) {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}

export function logIdFor(dateKey, classId) {
  return `${dateKey}_${classId}`
}

/** @param {Array<{title:string, day:any, start:any, end:any, location?:string}>} rows */
export function normalizeImportedRows(rows) {
  const out = []
  for (const row of rows) {
    const title = String(row.title || row.name || row.course || '').trim()
    if (!title) continue
    const dayOfWeek = parseDayOfWeek(row.day ?? row.dow ?? row.weekday)
    if (dayOfWeek === null) continue
    const startMinutes =
      typeof row.startMinutes === 'number'
        ? row.startMinutes
        : parseTimeToMinutes(row.start ?? row.from ?? row.begin)
    const endMinutes =
      typeof row.endMinutes === 'number'
        ? row.endMinutes
        : parseTimeToMinutes(row.end ?? row.to ?? row.finish)
    if (startMinutes == null || endMinutes == null) continue
    out.push({
      id: newClassId(),
      title,
      dayOfWeek,
      startMinutes,
      endMinutes,
      location: row.location ? String(row.location).trim() : '',
    })
  }
  return out
}

export function getTodaysClasses(classList, now = new Date()) {
  const dow = now.getDay()
  return classList
    .filter((c) => c.dayOfWeek === dow)
    .slice()
    .sort((a, b) => a.startMinutes - b.startMinutes)
}

export function nowMinutes(now = new Date()) {
  return now.getHours() * 60 + now.getMinutes()
}

/** True once class start time has passed today (student can log attendance). */
export function canLogAttendanceForClass(cls, now = new Date()) {
  if (cls.dayOfWeek !== now.getDay()) return false
  return nowMinutes(now) >= cls.startMinutes
}

export function weekOccurrencesCount(classList, weekStart = new Date()) {
  const start = new Date(weekStart)
  start.setHours(0, 0, 0, 0)
  const day = start.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(start)
  monday.setDate(start.getDate() + diffToMonday)
  let count = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dow = d.getDay()
    count += classList.filter((c) => c.dayOfWeek === dow).length
  }
  return count
}

/**
 * Among classes scheduled for **today only**, picks the latest one that has already ended
 * and still has no attendance log. Used for the post-login prompt (never past days).
 */
export function findTodayUnloggedPastClass(classList, attendanceMap, now = new Date()) {
  if (!classList?.length) return null
  const nowMs = now.getTime()
  const dayStart = new Date(now)
  dayStart.setHours(0, 0, 0, 0)
  const dow = dayStart.getDay()
  const dk = todayDateKey(dayStart)
  let best = null

  for (const cls of classList) {
    if (cls.dayOfWeek !== dow) continue
    const end = new Date(dayStart)
    end.setHours(Math.floor(cls.endMinutes / 60), cls.endMinutes % 60, 0, 0)
    const endMs = end.getTime()
    if (endMs >= nowMs) continue

    const lid = logIdFor(dk, cls.id)
    if (attendanceMap?.[lid]) continue

    if (!best || endMs > best.endMs) {
      best = { endMs, dateKey: dk, cls, dayStart: new Date(dayStart) }
    }
  }

  return best
}

/** One short line: date, time, timezone (for a slim header strip). */
export function formatCompactTodayLine(now = new Date()) {
  const datePart = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timePart = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  const tzLabel = tz.includes('/') ? tz.split('/').pop().replace(/_/g, ' ') : tz
  return tzLabel ? `${datePart} · ${timePart} · ${tzLabel}` : `${datePart} · ${timePart}`
}

/** Monday–Sunday calendar week as YYYY-MM-DD bounds (matches “slots this week”). */
export function isoWeekRangeKeys(now = new Date()) {
  const d = new Date(now)
  d.setHours(12, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return { start: todayDateKey(mon), end: todayDateKey(sun) }
}

export function attendanceCountsInRange(attendanceMap, startKey, endKey) {
  let attended = 0
  let missed = 0
  for (const e of Object.values(attendanceMap || {})) {
    const dk = e?.date
    if (!dk || dk < startKey || dk > endKey) continue
    if (e.attended) attended += 1
    else missed += 1
  }
  return { attended, missed, logged: attended + missed }
}
