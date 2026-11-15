'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Target, Users, Building2, Kanban, Activity, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-purple-600 font-bold text-xl tracking-tight">
              <Target className="w-7 h-7" />
              <span className="text-slate-900">Tradeo <span className="text-purple-600">NexusCRM</span></span>
            </Link>
            {user && (
              <nav className="hidden md:flex space-x-4 text-sm font-medium">
                <Link href="/" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-purple-600 hover:bg-slate-50 transition-colors">
                  Pipeline & Deals
                </Link>
                <Link href="/companies" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-purple-600 hover:bg-slate-50 transition-colors">
                  Companies
                </Link>
                <Link href="/contacts" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-purple-600 hover:bg-slate-50 transition-colors">
                  Contacts
                </Link>
                <Link href="/activities" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-purple-600 hover:bg-slate-50 transition-colors">
                  Activities & Tasks
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{user.role.toLowerCase().replace('_', ' ')}</div>
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
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
                >
                  Create Workspace
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
