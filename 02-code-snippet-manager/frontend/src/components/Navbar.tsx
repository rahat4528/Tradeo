'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Code2, Plus, Download, Upload, LogOut, LogIn, Search, Sparkles } from 'lucide-react';

interface NavbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onNewSnippet: () => void;
  onOpenImportExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  search,
  onSearchChange,
  onNewSnippet,
  onOpenImportExport,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-editor-border bg-editor-sidebar px-4 flex items-center justify-between flex-shrink-0 select-none">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
          <Code2 className="w-4 h-4" />
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="font-bold text-sm text-slate-100">Tradeo</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 font-mono">
            Snippets
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      {user && (
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code, titles, tags... (Ctrl + K)"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-editor-surface border border-editor-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {user ? (
          <>
            <button
              onClick={onNewSnippet}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Snippet</span>
            </button>

            <button
              onClick={onOpenImportExport}
              title="Import or Export Snippets"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-editor-surface rounded-lg transition-colors border border-editor-border"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-editor-border mx-1" />

            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              {user.email}
            </span>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-editor-surface rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-editor-surface rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
