import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { Navbar } from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tradeo TimeSync | Calendar Scheduling & Availability Coordinator',
  description: 'Enterprise event type scheduling, automated timezone normalization, buffer interval enforcement, and frictionless appointment booking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
              Tradeo TimeSync Calendar ERP &bull; Autonomous Concurrency & Meeting Scheduling Intelligence
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
