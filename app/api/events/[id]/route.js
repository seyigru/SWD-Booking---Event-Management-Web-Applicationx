import pool from '@/lib/db';
import { requireRole } from '@/lib/auth';

// returns one event with organiser name and a count of confirmed bookings
// LEFT JOIN keeps events with zero bookings, an inner JOIN would hide them
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query(
      'SELECT e.*, u.name AS organiser_name, COUNT(b.id) AS bookings_count ' +
      'FROM events e JOIN users u ON e.organiser_id = u.id ' +
      'LEFT JOIN bookings b ON b.event_id = e.id AND b.status = ? ' +
      'WHERE e.id = ? GROUP BY e.id',
      ['confirmed', id]
    );
    if (!rows[0]) return Response.json({ message: 'Event not found' }, { status: 404 });
    return Response.json(rows[0], { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// updates an event, organiser must own it, admins can edit any event for system-wide oversight
export async function PUT(req, { params }) {
  try {
    const { user, error } = await requireRole('organiser', 'admin');
    if (error) return error;

    const { id } = await params;
    // look up the owner first so we can do the ownership check before touching anything
    const [check] = await pool.query('SELECT organiser_id FROM events WHERE id = ?', [id]);
    if (!check[0]) return Response.json({ message: 'Event not found' }, { status: 404 });
    if (user.role !== 'admin' && check[0].organiser_id !== user.id)
      return Response.json({ message: 'You can only edit your own events' }, { status: 403 });

    const { title, description, date, location, capacity, price } = await req.json();

    // same field validation as POST, never trust the client
    if (!title || !date || !location)
      return Response.json({ message: 'Title, date and location are required' }, { status: 400 });
    if (!capacity || capacity < 1)
      return Response.json({ message: 'Capacity must be at least 1' }, { status: 400 });
    if (price === undefined || price < 0)
      return Response.json({ message: 'Price cannot be negative' }, { status: 400 });
    // block organisers from rescheduling an event into the past, same rule as POST
    if (new Date(date) <= new Date())
      return Response.json({ message: 'Event date must be in the future' }, { status: 400 });

    await pool.query(
      'UPDATE events SET title = ?, description = ?, date = ?, location = ?, capacity = ?, price = ? WHERE id = ?',
      [title, description, date, location, capacity, price, id]
    );
    return Response.json({ message: 'Event updated' }, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// deletes an event, organiser must own it, admins can delete any event
export async function DELETE(req, { params }) {
  try {
    const { user, error } = await requireRole('organiser', 'admin');
    if (error) return error;

    const { id } = await params;
    // ownership check, same shape as PUT, runs before any destructive query
    const [check] = await pool.query('SELECT organiser_id FROM events WHERE id = ?', [id]);
    if (!check[0]) return Response.json({ message: 'Event not found' }, { status: 404 });
    if (user.role !== 'admin' && check[0].organiser_id !== user.id)
      return Response.json({ message: 'You can only delete your own events' }, { status: 403 });

    // bookings have a foreign key to events, refuse cleanly with 409 if any exist instead of letting MySQL throw
    const [bookings] = await pool.query('SELECT id FROM bookings WHERE event_id = ?', [id]);
    if (bookings.length > 0)
      return Response.json({ message: 'Cannot delete event with existing bookings' }, { status: 409 });

    await pool.query('DELETE FROM events WHERE id = ?', [id]);
    return Response.json({ message: 'Event deleted' }, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
