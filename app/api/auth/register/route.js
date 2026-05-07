import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return Response.json({ message: 'All fields required' }, { status: 400 });
    if (password.length < 8)
      return Response.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    if (!email.includes('@'))
      return Response.json({ message: 'Invalid email format' }, { status: 400 });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return Response.json({ message: 'Email already registered' }, { status: 409 });

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, 'attendee']
    );

    await createSession(result.insertId);
    return Response.json({ message: 'Registered successfully' }, { status: 201 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}