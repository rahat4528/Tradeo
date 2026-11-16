'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Terminal, Database, Sliders, History, LogOut, User } from 'lucide-react';

interface NavbarProps {
  environments: any[];
  activeEnvironmentId: string;
  onSelectEnvironment: (id: string) => void;
  onOpenEnvModal: () => void;
  onToggleHistory: () => void;
}

export default function Navbar({
  environments,
  activeEnvironmentId,
  onSelectEnvironment,
  onOpenEnvModal,
  onToggleHistory,
}: NavbarProps) {
  const { user, workspace, logout } = useAuth();

  return (
    <header className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-2.5 font-bold text-white text-lg tracking-wide">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow">
            <Terminal className="w-4 h-4" />
          </div>
          <span>API Workbench</span>
        </Link>

        {workspace && (
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#21262d] text-xs text-gray-300 border border-[#30363d]">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Workspace: <strong className="text-white">{workspace.name}</strong></span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Environment Selector */}
        <div className="flex items-center space-x-1.5">
          <select
            value={activeEnvironmentId}
            onChange={(e) => onSelectEnvironment(e.target.value)}
            className="bg-[#21262d] border border-[#30363d] text-xs text-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name} {env.isDefault ? '(Default)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={onOpenEnvModal}
            title="Configure Environments"
            className="p-1.5 text-gray-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded transition"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* History Toggle */}
        <button
          onClick={onToggleHistory}
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-gray-300 hover:text-white rounded transition"
        >
          <History className="w-3.5 h-3.5 text-yellow-400" />
          <span className="hidden sm:inline">History</span>
        </button>

        {/* User Account / Auth */}
        {user ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-[#30363d]">
            <span className="text-xs text-gray-300 font-medium hidden sm:inline">{user.name}</span>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-red-400 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              href="/login"
              className="text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
