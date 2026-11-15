'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Calendar, Clock, CalendarDays, ExternalLink, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-sky-600 font-bold text-xl tracking-tight">
              <Calendar className="w-7 h-7" />
              <span className="text-slate-900">Tradeo <span className="text-sky-600">TimeSync</span></span>
            </Link>
            {user && (
              <nav className="hidden md:flex space-x-4 text-sm font-medium">
                <Link href="/" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-sky-600 hover:bg-slate-50 transition-colors">
                  Event Types
                </Link>
                <Link href="/bookings" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-sky-600 hover:bg-slate-50 transition-colors">
                  Bookings
                </Link>
                <Link href="/availability" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-sky-600 hover:bg-slate-50 transition-colors">
                  Availability
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <a
                  href={`/book/${user.username}/discovery-meeting`}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public Page</span>
                </a>
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500 font-mono">@{user.username} &bull; {user.timezone}</div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors"
                >
                  Create Host Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
