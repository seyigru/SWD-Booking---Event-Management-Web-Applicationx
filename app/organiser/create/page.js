'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// form for organisers to create a new event, posts to /api/events
export default function CreateEventPage() {
  // one piece of state per field, controlled inputs feed straight into setters
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  // submitting flag disables the button while the request is in flight, stops duplicate creates
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const user = await res.json();
        if (user.role !== 'organiser') router.push('/login');
      } catch (err) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // capacity and price come back as strings from the input, convert to numbers for the API
    const res = await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        date,
        location,
        capacity: Number(capacity),
        price: Number(price),
      }),
    });
    const data = await res.json();

    // server returned a validation error, show the message and let the user try again
    if (!res.ok) {
      setError(data.message);
      setSubmitting(false);
      return;
    }

    // success, send them back to the dashboard where the new event will appear
    router.push('/organiser');
  };

  return (
    <div className="form-container">
      <h1>Create Event</h1>
      {error && <p className="error-msg">{error}</p>}
      {/* required and min on inputs give browser-level validation and  server still validates everything */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          min="1"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
