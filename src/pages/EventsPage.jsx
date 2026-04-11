import { useEffect, useMemo, useState } from 'react'
import { onValue, ref, set } from 'firebase/database'
import Header from '../components/Header'
import StatRow from '../components/StatRow'
import { eventFeed } from '../data/mockData'
import { db } from '../lib/firebase'

function EventsPage({ onEventJoined, awardedActionKeys = [] }) {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [joinedEvents, setJoinedEvents] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [eventsError, setEventsError] = useState('')

  useEffect(() => {
    if (!db) {
      setEvents(eventFeed)
      setSelectedEventId(eventFeed[0]?.id || null)
      return undefined
    }

    const eventsRef = ref(db, 'events')
    const unsub = onValue(
      eventsRef,
      (snap) => {
        const val = snap.exists() ? snap.val() : null
        if (val === null) {
          // Keep a local fallback list; do not auto-write /events (can be blocked by stricter rules).
          setEvents(eventFeed)
          setSelectedEventId((prev) => prev || eventFeed[0]?.id || null)
          return
        }
        const list = Object.values(val)
        list.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
        setEvents(list)
        setSelectedEventId((prev) => {
          if (prev && list.some((e) => e.id === prev)) return prev
          return list[0]?.id ?? null
        })
        setEventsError('')
      },
      () => {
        setEvents(eventFeed)
        setSelectedEventId(eventFeed[0]?.id || null)
        console.warn('[CampusQuest] Could not read /events from Realtime Database (add rules for /events to sync).')
      },
    )
    return () => unsub()
  }, [])

  const selectedEvent = events.find((event) => event.id === selectedEventId) || null
  const pointsAvailable = events.reduce((sum, event) => sum + event.points, 0)
  const awardedJoinedIds = useMemo(
    () =>
      awardedActionKeys
        .filter((key) => key.startsWith('event-join-'))
        .map((key) => key.slice('event-join-'.length)),
    [awardedActionKeys],
  )
  const joinedSet = useMemo(() => new Set([...awardedJoinedIds, ...joinedEvents]), [awardedJoinedIds, joinedEvents])

  const handleAddEvent = async (event) => {
    event.preventDefault()
    const formEl = event.currentTarget
    const formData = new FormData(formEl)
    const title = String(formData.get('title') || '').trim()
    const datetime = String(formData.get('datetime') || '').trim()
    const location = String(formData.get('location') || '').trim()
    const points = Number(formData.get('points') || 0)
    const details = String(formData.get('details') || '').trim()
    const ticketUrl = String(formData.get('ticketUrl') || '').trim()

    if (!title || !datetime || !location || !points) return

    const id = `ev-${Date.now()}`
    const newEvent = {
      id,
      title,
      datetime,
      location,
      points,
      organizer: 'Student Organizer',
      price: 'TBD',
      capacity: 100,
      details: details || 'Details will be updated by organizer.',
      ticketUrl: ticketUrl || 'https://tickets.campusquest.local/new-event',
      createdAt: Date.now(),
    }

    if (!db) {
      setEvents((prev) => [newEvent, ...prev])
      setSelectedEventId(newEvent.id)
      setShowAddForm(false)
      formEl.reset()
      return
    }

    try {
      await set(ref(db, `events/${id}`), newEvent)
      setShowAddForm(false)
      formEl.reset()
      setEventsError('')
    } catch (err) {
      console.error(err)
      const code = String(err?.code || '').trim()
      setEventsError(
        code
          ? `Could not save event (${code}). Check database rules for /events.`
          : 'Could not save event. Check database rules for /events.',
      )
    }
  }

  const joinEvent = async (eventId) => {
    if (joinedSet.has(eventId)) return
    const targetEvent = events.find((event) => event.id === eventId)
    if (!targetEvent) return
    const awarded = onEventJoined ? await onEventJoined(targetEvent) : false
    if (awarded) {
      setJoinedEvents((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]))
    }
  }

  return (
    <>
      <Header icon="📅" title="Campus Events" subtitle="Important events with high point value first" />
      <StatRow
        stats={[
          { icon: '📌', value: String(events.length), label: 'Upcoming Events' },
          { icon: '📩', value: String(joinedSet.size), label: 'RSVPs Made' },
          { icon: '🏆', value: String(pointsAvailable), label: 'Points Available' },
        ]}
      />

      {eventsError ? (
        <p className="panel-error" role="alert">
          {eventsError}
        </p>
      ) : null}

      <section className="card panel">
        {events.map((event) => (
          <article
            key={event.id}
            className={`list-row clickable-row ${selectedEventId === event.id ? 'active-row' : ''}`}
            onClick={() => setSelectedEventId(event.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(keyEvent) => {
              if (keyEvent.key === 'Enter' || keyEvent.key === ' ') setSelectedEventId(event.id)
            }}
          >
            <div>
              <h4>{event.title}</h4>
              <p>
                {event.datetime} • {event.location}
              </p>
            </div>
            <div className="row-meta">
              <span>{event.points} pts</span>
              {joinedSet.has(event.id) ? <small>Joined</small> : null}
            </div>
          </article>
        ))}
      </section>

      {selectedEvent ? (
        <section className="card panel event-detail-panel">
          <div className="chat-header">
            <div>
              <h3>{selectedEvent.title}</h3>
              <p>
                {selectedEvent.datetime} • {selectedEvent.location}
              </p>
            </div>
            <span className="tag">{selectedEvent.points} pts</span>
          </div>

          <p>{selectedEvent.details}</p>
          <div className="member-strip">
            <strong>Organizer:</strong> {selectedEvent.organizer} • <strong>Price:</strong> {selectedEvent.price} •{' '}
            <strong>Capacity:</strong> {selectedEvent.capacity}
          </div>

          <div className="event-actions">
            <button
              type="button"
                onClick={() => joinEvent(selectedEvent.id)}
                disabled={joinedSet.has(selectedEvent.id)}
            >
                {joinedSet.has(selectedEvent.id) ? 'Joined Event' : 'Join Event'}
            </button>
            <a className="ghost-btn ticket-link" href={selectedEvent.ticketUrl} target="_blank" rel="noreferrer">
              Get Tickets
            </a>
          </div>
        </section>
      ) : null}

      <section className="card panel events-toolbar">
        <button type="button" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close Add Event' : 'Add Event'}
        </button>
      </section>

      {showAddForm ? (
        <section className="card panel">
          <h3>Add New Event</h3>
          <form className="event-form" onSubmit={handleAddEvent}>
            <input name="title" placeholder="Event title" required />
            <input name="datetime" placeholder="Date and time (e.g. Apr 10, 4:00 PM)" required />
            <input name="location" placeholder="Location" required />
            <input name="points" type="number" min="5" step="5" placeholder="Points (5, 10, 15...)" required />
            <input name="ticketUrl" placeholder="Ticket URL (optional)" />
            <textarea name="details" rows="3" placeholder="Event details (optional)" />
            <button type="submit">Create Event</button>
          </form>
        </section>
      ) : null}
    </>
  )
}

export default EventsPage
