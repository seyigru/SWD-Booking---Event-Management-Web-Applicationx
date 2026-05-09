import pool from '@/lib/db';
import { requireRole } from '@/lib/auth';

// POST /api/bookings - attendee books a spot on an event
export async function POST(req) {
  try {
    // only attendees can book (not organiser etc)
    const { user, error } = await requireRole('attendee');
    if (error) return error;

    const body = await req.json();
    const event_id = body.event_id;

    // need to know which event they want
    if (event_id === undefined || event_id === null || event_id === '') {
      return Response.json({ message: 'event_id is required' }, { status: 400 });
    }

    // grab capacity so we can check if full later
    const [events] = await pool.query('SELECT id, capacity FROM events WHERE id = ?', [
      event_id,
    ]);
    if (events.length === 0) {
      return Response.json({ message: 'Event not found' }, { status: 404 });
    }

    const event = events[0];
    // weird data — can't book if capacity broken or missing
    if (event.capacity == null || Number(event.capacity) < 1) {
      return Response.json({ message: 'Event capacity is invalid' }, { status: 400 });
    }

    // don't let same person book twice (confirmed only — cancelled doesn't count)
    const [dup] = await pool.query(
      'SELECT id FROM bookings WHERE user_id = ? AND event_id = ? AND status = ?',
      [user.id, event_id, 'confirmed']
    );
    if (dup.length > 0) {
      return Response.json({ message: 'You already have a confirmed booking for this event' }, { status: 409 });
    }

    // how many people already booked for this event
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS n FROM bookings WHERE event_id = ? AND status = ?',
      [event_id, 'confirmed']
    );
    const confirmedCount = Number(countRows[0].n);
    const capacity = Number(event.capacity);

    if (confirmedCount >= capacity) {
      return Response.json({ message: 'Event is full' }, { status: 400 });
    }

    // actually save it
    await pool.query(
      'INSERT INTO bookings (user_id, event_id, status) VALUES (?, ?, ?)',
      [user.id, event_id, 'confirmed']
    );

    return Response.json({ message: 'Booking confirmed' }, { status: 201 });
  } catch (err) {
    // something blew up in MySQL or JSON parsing
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
