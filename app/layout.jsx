import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata = {
  title: 'EventHub',
  description: 'Group booking app for events',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
