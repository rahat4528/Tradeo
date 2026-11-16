'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';
import {
  Activity,
  AlertTriangle,
  GitBranch,
  Terminal,
  Server,
  PlusCircle,
  LogOut,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  onOpenAddService?: () => void;
}

export function Sidebar({ onOpenAddService }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen border-r border-slate-800 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide">DevOps Center</h1>
            <p className="text-xs text-slate-400">Tradeo Infrastructure</p>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      {onOpenAddService && (
        <div className="px-4 py-3">
          <button
            onClick={onOpenAddService}
            className="w-full flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md py-2 px-3 text-xs font-medium transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Service</span>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <Link
          href="/"
          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition ${
            pathname === '/'
              ? 'bg-cyan-600/20 text-cyan-400'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Services & Overview</span>
        </Link>

        <Link
          href="/incidents"
          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition ${
            pathname === '/incidents'
              ? 'bg-cyan-600/20 text-cyan-400'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Incidents & Alerts</span>
        </Link>

        <Link
          href="/deployments"
          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition ${
            pathname === '/deployments'
              ? 'bg-cyan-600/20 text-cyan-400'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Deployments</span>
        </Link>

        <Link
          href="/logs"
          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition ${
            pathname === '/logs'
              ? 'bg-cyan-600/20 text-cyan-400'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Log Aggregation</span>
        </Link>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
            {user?.name?.slice(0, 2) || 'OP'}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Engineer'}</p>
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

export default Sidebar;
