'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EventCard from '@/components/EventCard';
import ErrorMessage from '@/components/ErrorMessage';

// home — anyone can see events, but only attendees can actually hit the book API
export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadEvents() {
    setError('');
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Could not load events');
        return;
      }
      const list = Array.isArray(data) ? data : [];
      const now = Date.now();
      // only show stuff still in the future 
      const upcoming = list.filter((e) => {
        const t = new Date(e.date).getTime();
        return !Number.isNaN(t) && t > now;
      });
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(upcoming);
    } catch {
      setError('Something went wrong loading events');
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (!cancelled) setUser(data.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleBook(event_id) {
    // don't send people to login before we know who they are 
    if (!sessionReady) {
      setError('Still checking your session — try again in a second.');
      return;
    }
    if (!user || user.role !== 'attendee') {
      router.push('/login');
      return;
    }

    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        //
      }
      if (!res.ok) {
        setError(data.message || 'Booking failed');
        return;
      }
      setSuccess(data.message || 'Booked!');
      await loadEvents();
    } catch {
      setError('Could not reach the server');
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Upcoming events</h1>
      {/* anyone can see the list, booking only works when logged in as an attendee, otherwise Book sends them to login */}

      <ErrorMessage message={error} />
      {success ? <p className="success-msg">{success}</p> : null}

      <div className="events-grid">
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} onBook={handleBook} />
        ))}
      </div>

      {events.length === 0 && !error ? (
        <p className="muted" style={{ marginTop: '20px' }}>
          No upcoming events right now.
        </p>
      ) : null}
    </div>
  );
}
