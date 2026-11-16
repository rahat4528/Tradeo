'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data.token, res.data.user, res.data.workspace);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-xl border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white mb-3 text-2xl shadow">
            N
          </div>
          <h1 className="text-xl font-bold text-gray-800">Notion Clone</h1>
          <p className="text-xs text-gray-500 mt-1">Log in to your workspace</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="writer@example.com"
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow"
          >
            <span>{isLoading ? 'Signing In...' : 'Continue with Email'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Create workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
