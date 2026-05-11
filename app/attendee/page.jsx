'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EventCard from '@/components/EventCard';
import ErrorMessage from '@/components/ErrorMessage';

// attendee home — list all events and let them book from the card
export default function AttendeeBrowsePage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ready, setReady] = useState(false);

  async function loadEvents() {
    setError('');
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Could not load events');
        return;
      }
      // API returns an array of rows
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setError('Something went wrong loading the page');
    }
  }

  useEffect(() => {
    let cancelled = false;

    // quick session check so organisers/admins dont sit on attendee pages
    (async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        const user = data.user ?? null;

        if (cancelled) return;

        if (!user) {
          router.push('/login');
          return;
        }

        if (user.role !== 'attendee') {
          router.push('/');
          return;
        }

        setReady(true);
        await loadEvents();
      } catch {
        if (!cancelled) router.push('/login');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function bookEvent(event_id) {
    if (!ready) return;
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
        // non json body
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
      <h1 className="page-title">Browse events</h1>

      <ErrorMessage message={error} />
      {success ? <p className="success-msg">{success}</p> : null}

      <div className="events-grid">
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} onBook={bookEvent} />
        ))}
      </div>
    </div>
  );
}
