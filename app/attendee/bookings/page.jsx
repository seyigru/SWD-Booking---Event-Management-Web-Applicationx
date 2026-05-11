'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BookingCard from '@/components/BookingCard';
import ErrorMessage from '@/components/ErrorMessage';

// logged in attendee sees their past and current bookings and can cancel confirmed ones
export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const user = await res.json();
        if (user.role !== 'attendee') router.push('/login');
      } catch (err) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  async function loadBookings() {
    setError('');
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Could not load bookings');
        return;
      }
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError('Something went wrong loading the page');
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function cancelBooking(id) {
    setError('');
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      let data = {};
      try {
        data = await res.json();
      } catch {
        //
      }
      if (!res.ok) {
        setError(data.message || 'Could not cancel booking');
        return;
      }
      await loadBookings();
    } catch {
      setError('Could not reach the server');
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">My bookings</h1>

      <ErrorMessage message={error} />

      <div className="bookings-list">
        {bookings.length === 0 && !error ? (
          <p className="muted">No bookings yet.</p>
        ) : (
          bookings.map((b) => <BookingCard key={b.id} booking={b} onCancel={cancelBooking} />)
        )}
      </div>
    </div>
  );
}
