'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchEvent = async () => {
    const res = await fetch(`/api/events/${id}`);
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    setEvent(data);
  };

  useEffect(() => { fetchEvent(); }, [id]);

  // Book button POSTs to /api/bookings
  const bookEvent = async () => {
    setError(''); setMessage('');
    const res = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ event_id: Number(id) }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    setMessage('Booking confirmed!');
    fetchEvent();
  };

  if (error) return (
    <div className="page-container">
      <p className="error-msg">{error}</p>
    </div>
  );
  if (!event) return <div className="page-container"><p>Loading...</p></div>;

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
