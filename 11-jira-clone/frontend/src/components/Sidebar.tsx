'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';
import {
  Kanban,
  ListOrdered,
  PlusCircle,
  FolderKanban,
  LogOut,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentProject: any;
  projects: any[];
  onSelectProject: (id: string) => void;
  onOpenCreateIssue: () => void;
}

export function Sidebar({
  currentProject,
  projects,
  onSelectProject,
  onOpenCreateIssue,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide">Agile Tracker</h1>
            <p className="text-xs text-slate-400">Tradeo Enterprise</p>
          </div>
        </div>
      </div>

      {/* Project Selector */}
      <div className="p-4 border-b border-slate-800">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Active Project
        </label>
        <select
          value={currentProject?.id || ''}
          onChange={(e) => onSelectProject(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.key}] {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 py-3">
        <button
          onClick={onOpenCreateIssue}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-3 text-xs font-medium transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Issue</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <a
          href="/board"
          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition ${
            pathname === '/board' || pathname === '/'
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Kanban className="w-4 h-4" />
          <span>Active Sprint Board</span>
        </a>

        <a
          href="/backlog"
          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition ${
            pathname === '/backlog'
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Backlog & Sprints</span>
        </a>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
            {user?.name?.slice(0, 2) || 'AD'}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
