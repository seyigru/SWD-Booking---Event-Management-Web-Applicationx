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
