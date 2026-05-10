'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// top bar - This will change links based on role from /api/auth/session
export default function Navbar() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (!cancelled) setUser(data.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // still send them home even if logout failed weirdly
    }
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
            <button type="button" className="navbar__logout btn btn--ghost" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
