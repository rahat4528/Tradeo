'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
}

export function AddServiceModal({ isOpen, onClose, onServiceAdded }: AddServiceModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [environment, setEnvironment] = useState('PRODUCTION');
  const [intervalSeconds, setIntervalSeconds] = useState(30);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    setLoading(true);
    try {
      await api.post('/services', {
        name: name.trim(),
        url: url.trim(),
        environment,
        intervalSeconds: Number(intervalSeconds),
      });
      setName('');
      setUrl('');
      onServiceAdded();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to register service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden text-slate-100">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Register Monitored Service</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Order Settlement Worker"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Healthcheck Endpoint URL *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://worker.tradeo.internal/health"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="PRODUCTION">Production</option>
                <option value="STAGING">Staging</option>
                <option value="DEVELOPMENT">Development</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Probe Interval
              </label>
              <select
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-medium bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition shadow disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
