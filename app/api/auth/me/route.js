import { getSession } from '@/lib/session';

// GET — returns the current logged-in user's data from their session cookie
export async function GET() {
  try {
    const user = await getSession();
    if (!user) return Response.json({ message: 'Not logged in' }, { status: 401 });
    return Response.json(user, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}