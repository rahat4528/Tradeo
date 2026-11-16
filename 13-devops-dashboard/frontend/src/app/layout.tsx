import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';

export const metadata: Metadata = {
  title: 'DevOps Observability & Health Command Center',
  description: 'Infrastructure health, service uptime, timeseries metrics, and incident management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
