
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// dashboard for organisers, lists their own events with edit and delete actions
export default function OrganiserPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // pulls only the logged-in organiser's events, server reads the session and filters
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events?mine=true');
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setEvents(data);
    } catch (err) {
      setError('Could not load events. Please try again');
    } finally {
      setLoading(false);
    }
  };

  // run auth first, then load events only if the user is a valid organiser
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const user = await res.json();
        if (user.role !== 'organiser') { router.push('/login'); return; }
        await fetchEvents();
      } catch (err) {
        router.push('/login');
      }
    };
    init();
  }, [router]);

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
      <div className="dashboard-toolbar">
        <h1 className="page-title">My Events</h1>
        <Link href="/organiser/create" className="btn btn--primary">Create new event</Link>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {/* show a friendly empty state when the organiser has no events instead of an empty table body */}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : events.length === 0 ? (
        <p className="muted">You have not created any events yet</p>
      ) : (
        <table className="data-table">
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
                  <div className="data-table__actions">
                    <Link href={`/organiser/edit/${event.id}`}>Edit</Link>
                    <button className="btn--danger" onClick={() => deleteEvent(event.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
