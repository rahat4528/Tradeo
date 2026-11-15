'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { CreateLinkModal } from '../../components/CreateLinkModal';
import { EditLinkModal } from '../../components/EditLinkModal';
import { QrModal } from '../../components/QrModal';
import { AnalyticsModal } from '../../components/AnalyticsModal';
import { formatDate } from '../../lib/utils';
import {
  Plus,
  Search,
  Copy,
  Check,
  QrCode,
  BarChart3,
  Edit2,
  Trash2,
  ExternalLink,
  Lock,
  Globe,
  Loader2,
  TrendingUp,
  LinkIcon,
  MousePointerClick,
  AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [links, setLinks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [overview, setOverview] = useState<{ totalLinks: number; totalClicks: number } | null>(null);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedLinkForEdit, setSelectedLinkForEdit] = useState<any | null>(null);
  const [selectedLinkForQr, setSelectedLinkForQr] = useState<any | null>(null);
  const [selectedLinkForAnalytics, setSelectedLinkForAnalytics] = useState<any | null>(null);

  // Fetch links
  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const [linksRes, overviewRes] = await Promise.all([
        api.links.list({
          page: pagination.page,
          limit: pagination.limit,
          search,
          sortBy,
          order,
        }),
        api.analytics.overview().catch(() => null),
      ]);

      setLinks(linksRes.data || []);
      setPagination(linksRes.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      if (overviewRes) setOverview(overviewRes);
    } catch (err) {
      console.error('Error fetching dashboard links:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, sortBy, order]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchLinks();
    }
  }, [authLoading, user, router, fetchLinks]);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, slug: string) => {
    if (window.confirm(`Are you sure you want to permanently delete /${slug}?`)) {
      try {
        await api.links.delete(id);
        fetchLinks();
      } catch (err: any) {
        alert(err.message || 'Failed to delete link');
      }
    }
  };

  const handleToggleStatus = async (link: any) => {
    try {
      await api.links.update(link.id, { isActive: !link.isActive });
      fetchLinks();
    } catch (err: any) {
      alert(err.message || 'Failed to update link status');
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Link Management</h1>
          <p className="text-xs text-slate-500">
            Create, brand, monitor, and configure redirects for your domains.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Short Link</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Active Links
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {overview?.totalLinks ?? pagination.total}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Clicks Recorded
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {(overview?.totalClicks ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg. Clicks Per Link
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {pagination.total > 0
                ? Math.round((overview?.totalClicks || 0) / pagination.total)
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by slug, URL, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end text-xs">
          <span className="text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="createdAt">Date Created</option>
            <option value="clickCount">Click Volume</option>
            <option value="slug">Slug Name</option>
          </select>
          <button
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            {order === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
          </button>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs">Loading links...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <LinkIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">No short links found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by creating your first shortened link with custom aliases and QR codes.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Link</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Short Link & Alias</th>
                  <th className="py-3 px-4">Destination Target</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4">Protection & Expiry</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {links.map((link) => {
                  const isExpired = link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
                  return (
                    <tr key={link.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              /{link.slug}
                            </span>
                            {link.domain && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px]">
                                <Globe className="w-2.5 h-2.5" />
                                <span>{link.domain.domain}</span>
                              </span>
                            )}
                          </div>
                          {link.description && (
                            <span className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                              {link.description}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Created {formatDate(link.createdAt)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 max-w-xs truncate">
                          <a
                            href={link.targetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-700 hover:text-emerald-600 truncate font-mono text-xs hover:underline"
                            title={link.targetUrl}
                          >
                            {link.targetUrl}
                          </a>
                          <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          {link.clickCount.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col space-y-1">
                          {link.isProtected ? (
                            <span className="inline-flex items-center space-x-1 text-amber-700 text-[11px]">
                              <Lock className="w-3 h-3" />
                              <span>Password Protected</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Public</span>
                          )}

                          {link.expiresAt && (
                            <span
                              className={`text-[11px] ${
                                isExpired ? 'text-red-600 font-semibold' : 'text-slate-500'
                              }`}
                            >
                              {isExpired ? 'Expired' : `Expires ${formatDate(link.expiresAt)}`}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(link)}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                            link.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {link.isActive ? 'Active' : 'Paused'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleCopy(link.id, link.shortUrl)}
                            title="Copy Short URL"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedLinkForQr(link)}
                            title="View QR Code"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedLinkForAnalytics(link)}
                            title="View Click Analytics"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedLinkForEdit(link)}
                            title="Edit Link"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id, link.slug)}
                            title="Delete Link"
                            className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateLinkModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => fetchLinks()}
      />

      <EditLinkModal
        isOpen={!!selectedLinkForEdit}
        link={selectedLinkForEdit}
        onClose={() => setSelectedLinkForEdit(null)}
        onUpdated={() => fetchLinks()}
      />

      <QrModal
        isOpen={!!selectedLinkForQr}
        link={selectedLinkForQr}
        onClose={() => setSelectedLinkForQr(null)}
      />

      <AnalyticsModal
        isOpen={!!selectedLinkForAnalytics}
        link={selectedLinkForAnalytics}
        onClose={() => setSelectedLinkForAnalytics(null)}
      />
    </div>
  );
}
