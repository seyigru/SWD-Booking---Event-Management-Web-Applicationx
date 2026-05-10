import { getSession } from '@/lib/session';

// so the Navbar can know who is logged in without sending the cookie to client JS manually
export async function GET() {
  try {
    const user = await getSession();
    return Response.json({ user: user ?? null }, { status: 200 });
  } catch {
    return Response.json({ user: null }, { status: 200 });
  }
}
