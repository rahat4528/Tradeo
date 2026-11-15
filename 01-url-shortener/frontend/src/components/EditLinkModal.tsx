'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { X, Lock, Calendar, AlertCircle, Edit3 } from 'lucide-react';

interface EditLinkModalProps {
  isOpen: boolean;
  link: any | null;
  onClose: () => void;
  onUpdated: (updated: any) => void;
}

export const EditLinkModal: React.FC<EditLinkModalProps> = ({
  isOpen,
  link,
  onClose,
  onUpdated,
}) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [redirectCode, setRedirectCode] = useState(307);
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (link) {
      setTargetUrl(link.targetUrl || '');
      setDescription(link.description || '');
      setPassword('');
      setExpiresAt(link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : '');
      setRedirectCode(link.redirectCode || 307);
      setIsActive(link.isActive ?? true);
      setError(null);
    }
  }, [link]);

  if (!isOpen || !link) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        targetUrl,
        description,
        redirectCode: Number(redirectCode),
        isActive,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).toISOString();
      } else {
        payload.expiresAt = null;
      }

      const updated = await api.links.update(link.id, payload);
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Edit Link</h3>
              <p className="text-xs text-slate-500 font-mono">/{link.slug}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Destination Target URL
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description / Campaign Name
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>New Password</span>
              </label>
              <input
                type="password"
                placeholder={link.isProtected ? '•••••••• (leave blank to keep)' : 'Set password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Expires At</span>
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Redirect Code
              </label>
              <select
                value={redirectCode}
                onChange={(e) => setRedirectCode(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value={307}>307 - Temporary Redirect</option>
                <option value={301}>301 - Moved Permanently</option>
                <option value={302}>302 - Found</option>
                <option value={308}>308 - Permanent Redirect</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Status
              </label>
              <div className="flex items-center h-10">
                <label className="inline-flex items-center cursor-pointer space-x-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700 font-medium">
                    {isActive ? 'Active (Resolving)' : 'Disabled (Paused)'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
