'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatDate } from '../../lib/utils';
import {
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function DomainsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [domainName, setDomainName] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const res = await api.domains.list();
      setDomains(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchDomains();
    }
  }, [authLoading, user, router]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.domains.create({
        domain: domainName.trim(),
        fallbackUrl: fallbackUrl.trim() || undefined,
      });
      setIsAddOpen(false);
      setDomainName('');
      setFallbackUrl('');
      fetchDomains();
    } catch (err: any) {
      setError(err.message || 'Failed to add domain');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, domain: string) => {
    if (window.confirm(`Are you sure you want to remove ${domain}? Short links using this domain will revert to the default host.`)) {
      try {
        await api.domains.delete(id);
        fetchDomains();
      } catch (err: any) {
        alert(err.message || 'Failed to delete domain');
      }
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm">Loading domains...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Custom Domains</h1>
          <p className="text-xs text-slate-500">
            Brand your short links with your own custom domain or subdomain (e.g., links.mybrand.com).
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Domain</span>
        </button>
      </div>

      {/* Domain List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-xs">Loading registered domains...</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">No custom domains configured</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your custom domain or subdomain to start serving links under your branded hostname.
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Domain</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {domains.map((d) => (
              <div
                key={d.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{d.domain}</span>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{d.isVerified ? 'Active & Verified' : 'Pending DNS'}</span>
                    </span>
                  </div>
                  {d.fallbackUrl && (
                    <div className="flex items-center space-x-1 text-xs text-slate-500 font-mono">
                      <span>Root redirects to:</span>
                      <a
                        href={d.fallbackUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:underline flex items-center space-x-0.5"
                      >
                        <span>{d.fallbackUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Added on {formatDate(d.createdAt)} &bull; {d._count?.links || 0} links attached
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDelete(d.id, d.domain)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Domain"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900">Add Custom Domain</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDomain} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Domain or Subdomain <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. s.mycompany.com"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Default Fallback URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://mycompany.com"
                  value={fallbackUrl}
                  onChange={(e) => setFallbackUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Visitors hitting the domain root will be redirected here.
                </span>
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm"
                >
                  {submitting ? 'Verifying...' : 'Register Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
