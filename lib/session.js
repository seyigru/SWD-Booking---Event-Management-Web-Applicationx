import pool from './db';
import { cookies } from 'next/headers';

// generates a token, stores in sessions table, sets HTTP-only cookie
export async function createSession(userId) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expires]
  );
  const cookieStore = await cookies();
  cookieStore.set('session_token', token, {
    httpOnly: true,
    expires: expires,
    path: '/',
  });
}

// reads cookie token, joins sessions to users, returns user or null
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  const [rows] = await pool.query(
    'SELECT u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW()',
    [token]
  );
  return rows[0] || null;
}

// deletes session row and clears the cookie
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (token) {
    await pool.query('DELETE FROM sessions WHERE token = ?', [token]);
    cookieStore.delete('session_token');
  }
}