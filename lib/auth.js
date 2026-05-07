import { getSession } from './session';

export async function requireRole(...allowedRoles) {
  const user = await getSession();
  if (!user) {
    return { error: Response.json({ message: 'Not logged in' }, { status: 401 }) };
  }
  if (!allowedRoles.includes(user.role)) {
    return { error: Response.json({ message: 'Access denied' }, { status: 403 }) };
  }
  return { user };
}