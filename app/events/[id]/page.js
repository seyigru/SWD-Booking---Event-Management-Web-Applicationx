'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// public event detail page, anyone can view, attendees can book
export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // pulls the event with organiser name and the live confirmed bookings count
  // try/catch falls back to a friendly message if the fetch itself throws, e.g. network drop
  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setEvent(data);
    } catch (err) {
      setError('Could not load event. Please try again');
    }
  };

  // re-runs if the [id] in the URL changes, useful for client-side navigation between events
  useEffect(() => { fetchEvent(); }, [id]);

  // posts a booking, the bookings API enforces role, capacity and double-book checks server-side
  // try/catch keeps a network failure from breaking the page and error shows in the same error-msg slot
  const bookEvent = async () => {
    setError(''); setMessage('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ event_id: Number(id) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setMessage('Booking confirmed!');
      // refetch so the spots-remaining number updates on screen
      fetchEvent();
    } catch (err) {
      setError('Could not book event. Please try again');
    }
  };

  // early returns keep the main render clean, only one of these branches runs at a time
  if (error) return (
    <div className="page-container">
      <p className="error-msg">{error}</p>
    </div>
  );
  if (!event) return <div className="page-container"><p>Loading...</p></div>;

  // capacity comes from the event row, bookings_count from the LEFT JOIN in GET /api/events/[id]
  const spotsRemaining = event.capacity - Number(event.bookings_count);

  return (
    <div className="page-container">
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Price:</strong> {event.price}</p>
      <p><strong>Organiser:</strong> {event.organiser_name}</p>
      <p><strong>Spots remaining:</strong> {spotsRemaining} of {event.capacity}</p>

      {message && <p className="success-msg">{message}</p>}
      <button onClick={bookEvent} disabled={spotsRemaining <= 0}>
        {spotsRemaining <= 0 ? 'Fully Booked' : 'Book this Event'}
      </button>
    </div>
  );
}
