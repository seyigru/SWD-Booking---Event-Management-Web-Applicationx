 'use client';
 
 import { createContext, useContext, useEffect, useMemo, useState } from 'react';
 
 const SessionContext = createContext(null);
 
 // keeps the logged in user in one place so Navbar updates after login/logout
 export function SessionProvider({ children }) {
   const [user, setUser] = useState(null);
   const [ready, setReady] = useState(false);
 
   async function refreshSession() {
     try {
       const res = await fetch('/api/auth/session');
       const data = await res.json();
       setUser(data.user ?? null);
     } catch {
       setUser(null);
     } finally {
       setReady(true);
     }
   }
 
   useEffect(() => {
    const load = async () => { await refreshSession(); };
    load();
  }, []);
 
   const value = useMemo(() => {
     return { user, setUser, ready, refreshSession };
   }, [user, ready]);
 
   return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
 }
 
 export function useSession() {
   const ctx = useContext(SessionContext);
   if (!ctx) throw new Error('useSession must be used inside SessionProvider');
   return ctx;
 }
