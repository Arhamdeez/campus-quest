import { useCallback, useEffect, useMemo, useState } from 'react'
import { onValue, ref, remove, set, update } from 'firebase/database'
import { db } from '../lib/firebase'
import { classesObjectToList, getTodaysClasses, logIdFor, weekOccurrencesCount } from '../lib/scheduleUtils'

const timetableStorageKey = (uid) => `cq_timetable_image_${uid}`

export function useUserSchedule(uid) {
  const [classesMap, setClassesMap] = useState({})
  const [attendanceMap, setAttendanceMap] = useState({})
  const [timetableDataUrl, setTimetableDataUrl] = useState(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!uid || !db) {
      setClassesMap({})
      setAttendanceMap({})
      return undefined
    }
    setLoadError('')
    const cRef = ref(db, `users/${uid}/schedule/classes`)
    const aRef = ref(db, `users/${uid}/schedule/attendance`)

    const unsubC = onValue(
      cRef,
      (snap) => {
        setClassesMap(snap.exists() ? snap.val() : {})
        setLoadError('')
      },
      (err) => {
        console.error(err)
        setLoadError('Could not load your schedule (check database rules).')
      },
    )
    const unsubA = onValue(
      aRef,
      (snap) => {
        setAttendanceMap(snap.exists() ? snap.val() : {})
      },
      () => {},
    )
    return () => {
      unsubC()
      unsubA()
    }
  }, [uid])

  useEffect(() => {
    if (!uid) {
      setTimetableDataUrl(null)
      return
    }
    try {
      const v = localStorage.getItem(timetableStorageKey(uid))
      setTimetableDataUrl(v || null)
    } catch {
      setTimetableDataUrl(null)
    }
  }, [uid])

  const classList = useMemo(() => classesObjectToList(classesMap), [classesMap])

  const stats = useMemo(() => {
    const entries = Object.values(attendanceMap || {})
    const attended = entries.filter((e) => e && e.attended === true).length
    const missed = entries.filter((e) => e && e.attended === false).length
    const pointsFromAttendance = entries.reduce((sum, e) => sum + (Number(e?.pointsAwarded) || 0), 0)
    return {
      attended,
      missed,
      logged: attended + missed,
      weekScheduled: weekOccurrencesCount(classList),
      totalClasses: classList.length,
      pointsFromAttendance,
    }
  }, [attendanceMap, classList])

  const saveTimetableImage = useCallback(
    (dataUrl) => {
      if (!uid) return
      try {
        if (dataUrl) {
          localStorage.setItem(timetableStorageKey(uid), dataUrl)
        } else {
          localStorage.removeItem(timetableStorageKey(uid))
        }
        setTimetableDataUrl(dataUrl || null)
      } catch (e) {
        console.error(e)
        throw new Error('Image is too large for browser storage. Try a smaller photo or use CSV import.')
      }
    },
    [uid],
  )

  const upsertClasses = useCallback(
    async (entries) => {
      if (!uid || !db || !entries?.length) return
      const updates = {}
      for (const row of entries) {
        const id = row.id
        const { id: _drop, ...rest } = row
        updates[`users/${uid}/schedule/classes/${id}`] = rest
      }
      await update(ref(db), updates)
    },
    [uid],
  )

  const removeClass = useCallback(
    async (classId) => {
      if (!uid || !db) return
      await remove(ref(db, `users/${uid}/schedule/classes/${classId}`))
    },
    [uid],
  )

  const recordAttendance = useCallback(
    async ({ classId, dateKey, attended, pointsAwarded = 0 }) => {
      if (!uid || !db) return
      const lid = logIdFor(dateKey, classId)
      await set(ref(db, `users/${uid}/schedule/attendance/${lid}`), {
        classId,
        date: dateKey,
        attended,
        at: Date.now(),
        pointsAwarded: attended ? pointsAwarded : 0,
      })
    },
    [uid],
  )

  const getTodaysClassesMemo = useCallback((now) => getTodaysClasses(classList, now), [classList])

  return {
    classList,
    attendanceMap,
    timetableDataUrl,
    loadError,
    stats,
    saveTimetableImage,
    upsertClasses,
    removeClass,
    recordAttendance,
    getTodaysClasses: getTodaysClassesMemo,
  }
}
