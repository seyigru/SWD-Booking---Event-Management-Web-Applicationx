'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// edit form for an existing event, pre-fills from GET /api/events/[id] and PUTs back on save
export default function EditEventPage() {
  // useParams gives us the [id] from the URL so we know which event to load
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  // submitting flag disables save while the PUT is in flight, stops duplicate updates
  const [submitting, setSubmitting] = useState(false);

  // on mount, load the event and copy each field into state so the inputs show the current values
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (!res.ok) { setError(data.message); return; }
        setTitle(data.title || '');
        setDescription(data.description || '');
        // datetime-local needs YYYY-MM-DDTHH:MM, slice off seconds and timezone from the ISO string
        setDate(data.date ? new Date(data.date).toISOString().slice(0, 16) : '');
        setLocation(data.location || '');
        setCapacity(data.capacity ?? '');
        setPrice(data.price ?? '');
      } catch (err) {
        setError('Could not load event. Please try again');
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // capacity and price are strings from the inputs, convert before sending
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
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

      // server validation failed or the user does not own this event, show the message
      if (!res.ok) {
        setError(data.message);
        setSubmitting(false);
        return;
      }

      // success, back to the dashboard where the updated row will show
      router.push('/organiser');
    } catch (err) {
      setError('Could not save changes. Please try again');
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Edit Event</h1>
      {error && <p className="error-msg">{error}</p>}
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
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
