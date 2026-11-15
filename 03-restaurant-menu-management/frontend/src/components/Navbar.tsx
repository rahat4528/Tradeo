'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Utensils, QrCode, ExternalLink, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onOpenQr?: () => void;
}

export function Navbar({ onOpenQr }: NavbarProps) {
  const { user, restaurant, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">MenuCraft</span>
            {restaurant && (
              <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                {restaurant.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {restaurant && (
            <>
              <button
                onClick={onOpenQr}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="View & Download QR Menu"
              >
                <QrCode className="h-4 w-4 text-slate-600" />
                <span>QR Menu</span>
              </button>
              <Link
                href={`/m/${restaurant.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
              >
                <span>Live Menu</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3 border-l pl-3 ml-1 border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                <div className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
