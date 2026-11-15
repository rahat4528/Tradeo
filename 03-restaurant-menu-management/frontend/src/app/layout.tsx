import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../lib/auth';

export const metadata: Metadata = {
  title: 'MenuCraft — Restaurant Menu Management System',
  description: 'Manage menus, items, categories, schedules, and live QR digital guest menus.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
