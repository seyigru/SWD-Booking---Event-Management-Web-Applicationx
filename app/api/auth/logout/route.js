import { destroySession } from '@/lib/session';

export async function POST() {
  try {
    await destroySession();
    return Response.json({ message: 'Logged out' }, { status: 200 });
  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}