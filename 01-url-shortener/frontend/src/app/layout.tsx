import './globals.css';
import { AuthProvider } from '../lib/auth';
import { Navbar } from '../components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tradeo URL Shortener | High-Performance Link Platform',
  description: 'Enterprise URL shortening, deep analytics, QR codes, and custom domains.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            Tradeo URL Shortener &bull; Independent Production Micro-Application &bull; 2026
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
