'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { CheckSquare, Plus, LogOut, Bell, Search } from 'lucide-react';

interface NavbarProps {
  onOpenCreateTask: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Navbar({ onOpenCreateTask, searchQuery, onSearchChange }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">TaskFlow</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              Workspace
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        {user && (
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, descriptions, or #tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-indigo-400 rounded-xl transition-all outline-none"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={onOpenCreateTask}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>

              <div className="flex items-center gap-3 border-l pl-3 border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800">{user.name || user.email}</div>
                  <div className="text-[10px] text-slate-400">{user.timezone}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
