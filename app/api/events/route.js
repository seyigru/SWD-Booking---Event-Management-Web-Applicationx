import pool from '@/lib/db';
import { requireRole } from '@/lib/auth';

// returns all events with organiser name, supports optional title search via LIKE
// also supports ?mine=true for the organiser dashboard, returns only their own events
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const mine = searchParams.get('mine');

    let rows;
    if (mine === 'true') {
      // dashboard mode, must be a logged-in organiser, filters by their user id
      const { user, error } = await requireRole('organiser');
      if (error) return error;
      [rows] = await pool.query(
        'SELECT e.*, u.name AS organiser_name FROM events e JOIN users u ON e.organiser_id = u.id WHERE e.organiser_id = ? ORDER BY e.date ASC',
        [user.id]
      );
    } else if (query) {
      // search by title, parameterised LIKE so user input never goes into the SQL string
      [rows] = await pool.query(
        'SELECT e.*, u.name AS organiser_name FROM events e JOIN users u ON e.organiser_id = u.id WHERE e.title LIKE ? ORDER BY e.date ASC',
        [`%${query}%`]
      );
    } else {
      // public browse, all events with the organiser name joined in
      [rows] = await pool.query(
        'SELECT e.*, u.name AS organiser_name FROM events e JOIN users u ON e.organiser_id = u.id ORDER BY e.date ASC'
      );
    }

    return Response.json(rows, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// creates a new event owned by the logged-in organiser, blocks anyone else via requireRole
export async function POST(req) {
  try {
    const { user, error } = await requireRole('organiser');
    if (error) return error;

    const { title, description, date, location, capacity, price } = await req.json();

    // server-side validation, never trust the client to enforce these
    if (!title || !date || !location)
      return Response.json({ message: 'Title, date and location are required' }, { status: 400 });
    if (!capacity || capacity < 1)
      return Response.json({ message: 'Capacity must be at least 1' }, { status: 400 });
    if (price === undefined || price < 0)
      return Response.json({ message: 'Price cannot be negative' }, { status: 400 });
    if (new Date(date) <= new Date())
      return Response.json({ message: 'Event date must be in the future' }, { status: 400 });

    // organiser_id comes from the session, not the request body, so users cannot spoof ownership
    await pool.query(
      'INSERT INTO events (title, description, date, location, capacity, price, organiser_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, date, location, capacity, price, user.id]
    );
    return Response.json({ message: 'Event created' }, { status: 201 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}