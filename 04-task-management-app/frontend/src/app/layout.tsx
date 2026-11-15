import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../lib/auth';

export const metadata: Metadata = {
  title: 'TaskFlow — Production Task & Productivity Management',
  description: 'Manage tasks, recurring deadlines, subtask checklists, and team productivity.',
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
