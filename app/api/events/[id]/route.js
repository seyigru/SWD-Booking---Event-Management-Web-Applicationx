import pool from '@/lib/db';
import { requireRole } from '@/lib/auth';

// GET — public. Single event with organiser name (JOIN) and confirmed booking count (LEFT JOIN).
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

// PUT — organiser only. The organiser must own the event before they can edit it.
export async function PUT(req, { params }) {
  try {
    const { user, error } = await requireRole('organiser');
    if (error) return error;

    const { id } = await params;
    const [check] = await pool.query('SELECT organiser_id FROM events WHERE id = ?', [id]);
    if (!check[0]) return Response.json({ message: 'Event not found' }, { status: 404 });
    if (check[0].organiser_id !== user.id)
      return Response.json({ message: 'You can only edit your own events' }, { status: 403 });

    const { title, description, date, location, capacity, price } = await req.json();

    // Server-side validation — same rules as POST
    if (!title || !date || !location)
      return Response.json({ message: 'Title, date and location are required' }, { status: 400 });
    if (!capacity || capacity < 1)
      return Response.json({ message: 'Capacity must be at least 1' }, { status: 400 });
    if (price === undefined || price < 0)
      return Response.json({ message: 'Price cannot be negative' }, { status: 400 });

    await pool.query(
      'UPDATE events SET title = ?, description = ?, date = ?, location = ?, capacity = ?, price = ? WHERE id = ?',
      [title, description, date, location, capacity, price, id]
    );
    return Response.json({ message: 'Event updated' }, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// DELETE — organiser (own event) or admin.
export async function DELETE(req, { params }) {
  try {
    const { user, error } = await requireRole('organiser', 'admin');
    if (error) return error;

    const { id } = await params;
    const [check] = await pool.query('SELECT organiser_id FROM events WHERE id = ?', [id]);
    if (!check[0]) return Response.json({ message: 'Event not found' }, { status: 404 });
    if (user.role !== 'admin' && check[0].organiser_id !== user.id)
      return Response.json({ message: 'You can only delete your own events' }, { status: 403 });

    await pool.query('DELETE FROM events WHERE id = ?', [id]);
    return Response.json({ message: 'Event deleted' }, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
