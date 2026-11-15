'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { Calendar, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState(
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username,
          name,
          email,
          password,
          timezone,
        }),
      });
      login(data.accessToken || data.token, data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Create Host Account</h1>
        <p className="text-sm text-slate-500 mt-1">
          Share your availability and eliminate scheduling back-and-forth
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
            Username (Booking URL Slug) *
          </label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-xs text-slate-500 font-mono">
              /book/
            </span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="w-full px-3 py-2 border border-slate-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
              placeholder="alex-mercer"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            placeholder="Alex Mercer"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Work Email *
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
            Password (min 8 characters) *
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Primary Timezone *
          </label>
          <input
            type="text"
            required
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            placeholder="America/New_York"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span>{loading ? 'Creating Host Account...' : 'Register & Enter Workspace'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-sky-600 font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
