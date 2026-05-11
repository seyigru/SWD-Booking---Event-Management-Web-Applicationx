'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/SessionProvider';

// top bar — this will change links based on role from SessionProvider
export default function Navbar() {
  const { user, setUser, ready, refreshSession } = useSession();
  // disables the logout button while a request is in flight so rapid clicks dont fire multiple logouts
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // still send them home even if logout failed weirdly
    }
    // update nav straight away, then bounce home
    setUser(null);
    await refreshSession();
    window.location.href = '/';
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link href="/" className="navbar__logo">
          EventHub
        </Link>

        {!ready ? (
          <nav className="navbar__links" aria-label="Main">
            <span className="navbar__spacer" />
          </nav>
        ) : !user ? (
          <nav className="navbar__links" aria-label="Main">
            <Link href="/login" className="navbar__link">
              Login
            </Link>
            <Link href="/register" className="navbar__link">
              Register
            </Link>
          </nav>
        ) : (
          <nav className="navbar__links" aria-label="Main">
            {user.role === 'attendee' ? (
              <>
                <Link href="/attendee" className="navbar__link">
                  Browse Events
                </Link>
                <Link href="/attendee/bookings" className="navbar__link">
                  My Bookings
                </Link>
              </>
            ) : null}
            {user.role === 'organiser' ? (
              <Link href="/organiser" className="navbar__link">
                My Events
              </Link>
            ) : null}
            {user.role === 'admin' ? (
              <Link href="/admin" className="navbar__link">
                Admin Panel
              </Link>
            ) : null}
            <button type="button" className="navbar__logout btn btn--ghost" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
