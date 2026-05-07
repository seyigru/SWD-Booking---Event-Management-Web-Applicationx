import pool from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    let rows;
    if (query) {
      // Search feature — LIKE with parameterised query, never string interpolation
      [rows] = await pool.query(
        'SELECT e.*, u.name AS organiser_name FROM events e JOIN users u ON e.organiser_id = u.id WHERE e.title LIKE ? ORDER BY e.date ASC',
        [`%${query}%`]
      );
    } else {
      [rows] = await pool.query(
        'SELECT e.*, u.name AS organiser_name FROM events e JOIN users u ON e.organiser_id = u.id ORDER BY e.date ASC'
      );
    }

    return Response.json(rows, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}