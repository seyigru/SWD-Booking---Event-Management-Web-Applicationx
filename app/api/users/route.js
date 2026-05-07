import pool from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const { user, error } = await requireRole('admin');
    if (error) return error;

    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users'
    );
    return Response.json(rows, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}