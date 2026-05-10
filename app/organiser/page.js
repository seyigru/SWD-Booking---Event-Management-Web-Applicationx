'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// dashboard for organisers, lists their own events with edit and delete actions
export default function OrganiserPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  // pulls only the logged-in organiser's events, server reads the session and filters
  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events?mine=true');
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setEvents(data);
    } catch (err) {
      setError('Could not load events. Please try again');
    }
  };

  // load once on mount, empty dependency array means it does not refetch on every render
  useEffect(() => { fetchEvents(); }, []);

  // confirm before deleting so a stray click cannot wipe an event, then refetch to refresh the list
  const deleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      fetchEvents();
    } catch (err) {
      setError('Could not delete event. Please try again');
    }
  };

  return (
    <div className="page-container">
      <h1>My Events</h1>
      {error && <p className="error-msg">{error}</p>}
      <Link href="/organiser/create">Create new event</Link>
      {events.length === 0 ? (
        <p>You have not created any events yet</p>
      ) : (
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
      )}
    </div>
  );
}
