'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Boxes, LogOut, Warehouse, Truck, RefreshCw, BarChart3, UserCheck } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-emerald-600 font-bold text-xl tracking-tight">
              <Boxes className="w-7 h-7" />
              <span className="text-slate-900">Tradeo <span className="text-emerald-600">StockMaster</span></span>
            </Link>
            {user && (
              <nav className="hidden md:flex space-x-4 text-sm font-medium">
                <Link href="/" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-emerald-600 hover:bg-slate-50 transition-colors">
                  Inventory
                </Link>
                <Link href="/warehouses" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-emerald-600 hover:bg-slate-50 transition-colors">
                  Warehouses
                </Link>
                <Link href="/movements" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-emerald-600 hover:bg-slate-50 transition-colors">
                  Stock Movements
                </Link>
                <Link href="/suppliers" className="px-3 py-1.5 rounded-md text-slate-700 hover:text-emerald-600 hover:bg-slate-50 transition-colors">
                  Suppliers & POs
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</div>
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
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
