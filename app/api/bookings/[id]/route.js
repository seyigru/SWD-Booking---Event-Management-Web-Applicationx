import pool from '@/lib/db';
import { requireRole } from '@/lib/auth';

// GET — returns a single booking by id, attendee only
export async function GET(req, { params }) {
  try {
    const { user, error } = await requireRole('attendee');
    if (error) return error;
    const { id } = await params;
    const [rows] = await pool.query(
      'SELECT b.*, e.title, e.date, e.location FROM bookings b JOIN events e ON b.event_id = e.id WHERE b.id = ? AND b.user_id = ?',
      [id, user.id]
    );
    if (!rows[0]) return Response.json({ message: 'Booking not found' }, { status: 404 });
    return Response.json(rows[0], { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// PUT — updates booking status, blocks changes to other users bookings, attendee only
export async function PUT(req, { params }) {
  try {
    const { user, error } = await requireRole('attendee');
    if (error) return error;
    const { id } = await params;
    const { status } = await req.json();

    if (!['confirmed', 'cancelled'].includes(status))
      return Response.json({ message: 'Invalid status' }, { status: 400 });

    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!rows[0]) return Response.json({ message: 'Booking not found' }, { status: 404 });
    if (rows[0].user_id !== user.id)
      return Response.json({ message: 'You can only update your own bookings' }, { status: 403 });

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    return Response.json({ message: 'Booking updated' }, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// DELETE — soft cancels a booking, blocks cancellation of other users bookings, attendee only
export async function DELETE(req, { params }) {
  try {
    const { user, error } = await requireRole('attendee');
    if (error) return error;
    const { id } = await params;
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!rows[0]) return Response.json({ message: 'Booking not found' }, { status: 404 });
    if (rows[0].user_id !== user.id)
      return Response.json({ message: 'You can only cancel your own bookings' }, { status: 403 });
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);
    return Response.json({ message: 'Booking cancelled' }, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}