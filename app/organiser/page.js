'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OrganiserPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  // Fetch only the logged-in organiser's own events (server filters via ?mine=true)
  const fetchEvents = async () => {
    const res = await fetch('/api/events?mine=true');
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    setEvents(data);
  };

  useEffect(() => { fetchEvents(); }, []);

  const deleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const res = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    fetchEvents();
  };

  return (
    <div className="page-container">
      <h1>My Events</h1>
      {error && <p className="error-msg">{error}</p>}
      <Link href="/organiser/create">Create new event</Link>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Location</th>
            <th>Capacity</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event.id}>
              <td>{event.title}</td>
              <td>{new Date(event.date).toLocaleString()}</td>
              <td>{event.location}</td>
              <td>{event.capacity}</td>
              <td>{event.price}</td>
              <td>
                <Link href={`/organiser/edit/${event.id}`}>Edit</Link>
                <button onClick={() => deleteEvent(event.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
