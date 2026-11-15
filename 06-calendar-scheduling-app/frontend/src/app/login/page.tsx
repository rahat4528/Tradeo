'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { Calendar, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.accessToken || data.token, data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Sign in to TimeSync</h1>
        <p className="text-sm text-slate-500 mt-1">
          Access your calendar scheduling console
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            placeholder="alex@timesync.io"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
        New host?{' '}
        <Link href="/register" className="text-sky-600 font-semibold hover:underline">
          Create host account
        </Link>
      </div>
    </div>
  );
}
