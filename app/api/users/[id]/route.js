import pool from '@/lib/db';
import { requireRole } from '@/lib/auth';

// updates a user's role, validates role value, admin only
export async function PUT(req, { params }) {
  try {
    const { user, error } = await requireRole('admin');
    if (error) return error;

    const { id } = await params;
    const { role } = await req.json();

    if (!['organiser', 'attendee', 'admin'].includes(role))
      return Response.json({ message: 'Invalid role' }, { status: 400 });

    const [check] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!check[0])
      return Response.json({ message: 'User not found' }, { status: 404 });

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return Response.json({ message: 'Role updated' }, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// removes user and their sessions, blocks self-deletion, admin only
export async function DELETE(req, { params }) {
  try {
    const { user, error } = await requireRole('admin');
    if (error) return error;

    const { id } = await params;

    if (user.id === parseInt(id))
      return Response.json({ message: 'You cannot delete your own account' }, { status: 400 });

    const [check] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!check[0])
      return Response.json({ message: 'User not found' }, { status: 404 });

    await pool.query('DELETE FROM sessions WHERE user_id = ?', [id]);
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return Response.json({ message: 'User deleted' }, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}