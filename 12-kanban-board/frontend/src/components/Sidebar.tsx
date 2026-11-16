'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';
import {
  Trello,
  LineChart,
  PlusCircle,
  LogOut,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  currentBoard: any;
  boards: any[];
  onSelectBoard: (id: string) => void;
  onOpenCreateCard: () => void;
}

export function Sidebar({
  currentBoard,
  boards,
  onSelectBoard,
  onOpenCreateCard,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen border-r border-slate-800 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow">
            <Trello className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide">Kanban Flow</h1>
            <p className="text-xs text-slate-400">Lean WIP Management</p>
          </div>
        </div>
      </div>

      {/* Board Selector */}
      <div className="p-4 border-b border-slate-800">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Active Board
        </label>
        <select
          value={currentBoard?.id || ''}
          onChange={(e) => onSelectBoard(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 py-3">
        <button
          onClick={onOpenCreateCard}
          className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-2 px-3 text-xs font-medium transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Work Card</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <Link
          href="/"
          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition ${
            pathname === '/'
              ? 'bg-emerald-600/20 text-emerald-400'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Trello className="w-4 h-4" />
          <span>Process Flow Board</span>
        </Link>

        <Link
          href="/analytics"
          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition ${
            pathname === '/analytics'
              ? 'bg-emerald-600/20 text-emerald-400'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <LineChart className="w-4 h-4" />
          <span>Cycle Time & CFD</span>
        </Link>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
            {user?.name?.slice(0, 2) || 'KB'}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-slate-900 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
