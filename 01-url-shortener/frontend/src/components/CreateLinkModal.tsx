'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { X, Lock, Calendar, Globe, AlertCircle, Sparkles } from 'lucide-react';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (link: any) => void;
}

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [redirectCode, setRedirectCode] = useState(307);
  const [domainId, setDomainId] = useState('');
  const [domains, setDomains] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.domains
        .list()
        .then((res) => setDomains(res || []))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        targetUrl,
        redirectCode: Number(redirectCode),
      };
      if (customAlias.trim()) payload.customAlias = customAlias.trim();
      if (description.trim()) payload.description = description.trim();
      if (password.trim()) payload.password = password.trim();
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();
      if (domainId) payload.domainId = domainId;

      const created = await api.links.create(payload);
      onCreated(created);
      onClose();
      // Reset form
      setTargetUrl('');
      setCustomAlias('');
      setDescription('');
      setPassword('');
      setExpiresAt('');
      setDomainId('');
    } catch (err: any) {
      setError(err.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900">Create Short Link</h3>
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
              Destination URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com/long-page-address"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Custom Alias
              </label>
              <input
                type="text"
                placeholder="my-link (optional)"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Domain
              </label>
              <select
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="">Default Domain</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.domain}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description / Title
            </label>
            <input
              type="text"
              placeholder="E.g., Q4 Marketing Campaign"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Password (Optional)</span>
              </label>
              <input
                type="password"
                placeholder="Protect redirect"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Expires At (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Redirect HTTP Status Code
            </label>
            <select
              value={redirectCode}
              onChange={(e) => setRedirectCode(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value={307}>307 - Temporary Redirect (Default, preserves method)</option>
              <option value={301}>301 - Moved Permanently (SEO permanent cache)</option>
              <option value={302}>302 - Found (Standard temporary redirect)</option>
              <option value={308}>308 - Permanent Redirect (Preserves POST method)</option>
            </select>
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
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {loading ? 'Creating...' : 'Shorten Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
