'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Kanban, LayoutGrid, Plus, LogOut, User } from 'lucide-react';

interface NavbarProps {
  onOpenCreateBoard?: () => void;
}

export default function Navbar({ onOpenCreateBoard }: NavbarProps) {
  const { user, workspace, logout } = useAuth();

  return (
    <header className="bg-[#026aa7] text-white px-4 py-2 flex items-center justify-between border-b border-[#005a8e] shadow-sm select-none">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2 font-bold text-lg hover:opacity-90 transition">
          <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center">
            <Kanban className="w-4 h-4 text-white" />
          </div>
          <span>Trello Clone</span>
        </Link>

        <Link
          href="/"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Boards</span>
        </Link>

        {onOpenCreateBoard && (
          <button
            onClick={onOpenCreateBoard}
            className="flex items-center space-x-1 px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {user ? (
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium bg-white/15 px-2.5 py-1 rounded">
              {user.name}
            </span>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded hover:bg-white/20 transition text-white/80 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              href="/login"
              className="text-xs px-3 py-1.5 rounded bg-white text-[#026aa7] font-semibold hover:bg-white/90 transition shadow-sm"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
