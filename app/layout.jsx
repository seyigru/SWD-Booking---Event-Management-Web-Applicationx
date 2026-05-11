import Navbar from '@/components/Navbar';
import '@/styles/globals.css';
import { SessionProvider } from '@/components/SessionProvider';

export const metadata = {
  title: 'EventHub',
  description: 'Group booking app for events',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
