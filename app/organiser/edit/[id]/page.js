'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  // On mount, fetch the event and pre-fill the form
  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setTitle(data.title || '');
      setDescription(data.description || '');
      // datetime-local needs YYYY-MM-DDTHH:MM (slice off seconds and timezone)
      setDate(data.date ? new Date(data.date).toISOString().slice(0, 16) : '');
      setLocation(data.location || '');
      setCapacity(data.capacity ?? '');
      setPrice(data.price ?? '');
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

    if (!res.ok) {
      setError(data.message);
      return;
    }

    router.push('/organiser');
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
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
