'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { Lock, ArrowRight, AlertCircle, Link2 } from 'lucide-react';

export default function PasswordPromptPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.redirect.verifyPassword(slug, password);
      if (res?.targetUrl) {
        window.location.href = res.targetUrl;
      } else {
        setError('Failed to resolve target destination.');
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Protected Short Link</h2>
          <p className="text-xs text-slate-500 font-mono">
            /{slug}
          </p>
          <p className="text-xs text-slate-600">
            This short link is encrypted and requires a password to redirect.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Enter Password
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Verifying...' : 'Unlock & Proceed'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
