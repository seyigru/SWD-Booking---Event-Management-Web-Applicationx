import pool from '@/lib/db';
import { requireRole } from '@/lib/auth';

// DELETE /api/bookings/[id] - attendee cancels their own booking
export async function DELETE(req, { params }) {
  try {
    const { user, error } = await requireRole('attendee');
    if (error) return error;

    const { id } = await params;

    // This will load the row so we can check it exists and belongs to this person
    const [rows] = await pool.query(
      'SELECT id, user_id, status FROM bookings WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return Response.json({ message: 'Booking not found' }, { status: 404 });
    }

    const booking = rows[0];
    if (booking.user_id !== user.id) {
      return Response.json({ message: "You can't cancel someone else's booking" }, { status: 403 });
    }

    // This will soft delete — row stays in DB but status says cancelled
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);

    return Response.json({ message: 'Booking cancelled' }, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
