import { useState } from 'react'
import Header from '../components/Header'
import StatRow from '../components/StatRow'
import { eventFeed } from '../data/mockData'

function EventsPage({ onEventJoined }) {
  const [events, setEvents] = useState(eventFeed)
  const [selectedEventId, setSelectedEventId] = useState(eventFeed[0]?.id || null)
  const [joinedEvents, setJoinedEvents] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)

  const selectedEvent = events.find((event) => event.id === selectedEventId) || null
  const pointsAvailable = events.reduce((sum, event) => sum + event.points, 0)

  const handleAddEvent = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') || '').trim()
    const datetime = String(formData.get('datetime') || '').trim()
    const location = String(formData.get('location') || '').trim()
    const points = Number(formData.get('points') || 0)
    const details = String(formData.get('details') || '').trim()
    const ticketUrl = String(formData.get('ticketUrl') || '').trim()

    if (!title || !datetime || !location || !points) return

    const newEvent = {
      id: `ev-${Date.now()}`,
      title,
      datetime,
      location,
      points,
      organizer: 'Student Organizer',
      price: 'TBD',
      capacity: 100,
      details: details || 'Details will be updated by organizer.',
      ticketUrl: ticketUrl || 'https://tickets.campusquest.local/new-event',
    }

    setEvents((prev) => [newEvent, ...prev])
    setSelectedEventId(newEvent.id)
    setShowAddForm(false)
    event.currentTarget.reset()
  }

  const joinEvent = (eventId) => {
    if (joinedEvents.includes(eventId)) return
    const targetEvent = events.find((event) => event.id === eventId)
    setJoinedEvents((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]))
    if (targetEvent && onEventJoined) onEventJoined(targetEvent)
  }

  return (
    <>
      <Header icon="📅" title="Campus Events" subtitle="Important events with high point value first" />
      <StatRow
        stats={[
          { icon: '📌', value: String(events.length), label: 'Upcoming Events' },
          { icon: '📩', value: String(joinedEvents.length), label: 'RSVPs Made' },
          { icon: '🏆', value: String(pointsAvailable), label: 'Points Available' },
        ]}
      />

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
            <input name="points" type="number" min="1" placeholder="Points" required />
            <input name="ticketUrl" placeholder="Ticket URL (optional)" />
            <textarea name="details" rows="3" placeholder="Event details (optional)" />
            <button type="submit">Create Event</button>
          </form>
        </section>
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
              {joinedEvents.includes(event.id) ? <small>Joined</small> : null}
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
              disabled={joinedEvents.includes(selectedEvent.id)}
            >
              {joinedEvents.includes(selectedEvent.id) ? 'Joined Event' : 'Join Event'}
            </button>
            <a className="ghost-btn ticket-link" href={selectedEvent.ticketUrl} target="_blank" rel="noreferrer">
              Get Tickets
            </a>
          </div>
        </section>
      ) : null}
    </>
  )
}

export default EventsPage
