'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { QrModal } from '../components/QrModal';
import { Link2, ArrowRight, Copy, Check, QrCode, Shield, Zap, BarChart2, Globe, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [targetUrl, setTargetUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setLoading(true);
    setError(null);
    try {
      const payload: any = { targetUrl };
      if (customAlias.trim()) payload.customAlias = customAlias.trim();

      const created = await api.links.create(payload);
      setResult(created);
    } catch (err: any) {
      setError(err.message || 'Failed to shorten link');
    } finally {
      setLoading(false);
    }
  };

  const copyShortUrl = () => {
    if (!result?.shortUrl) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>High-Speed, Enterprise Link Platform</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Smarter, Shorter, <span className="text-emerald-600">Measurable</span> Links.
        </h1>
        <p className="text-base sm:text-lg text-slate-600">
          Transform long, cumbersome web addresses into memorable branded links. Track every visit with deep telemetry, protect links with passwords, and generate instant QR codes.
        </p>
      </div>

      {/* Instant Shortener Form */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
        <form onSubmit={handleShorten} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Paste your destination URL
            </label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://example.com/very-long-product-or-article-url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Custom slug (optional, e.g. launch-2026)"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !targetUrl}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Shortening...' : 'Shorten URL'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}
        </form>

        {/* Shortened Link Result Box */}
        {result && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in duration-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Your Short Link is Ready:
            </span>
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="truncate">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-semibold text-emerald-800 hover:underline text-sm sm:text-base truncate block"
                >
                  {result.shortUrl}
                </a>
                <span className="text-xs text-emerald-600 truncate block mt-0.5">
                  Redirects to: {result.targetUrl}
                </span>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={copyShortUrl}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs font-medium rounded-lg flex items-center space-x-1.5 shadow-2xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs font-medium rounded-lg flex items-center space-x-1.5 shadow-2xs transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-slate-900">Sub-Millisecond Speed</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Engineered with a high-performance Redis cache tier ensuring lightning-fast redirects regardless of incoming traffic spikes.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-slate-900">Deep Telemetry Analytics</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Inspect total and unique clicks, geographic regions, referrer domains, browsers, and mobile vs desktop device distributions.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-slate-900">Custom Slugs & Security</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Configure custom branded aliases, link expiration timers, and password protection against unauthorized visitors.
          </p>
        </div>
      </div>

      {/* Call to action */}
      {!user && (
        <div className="max-w-2xl mx-auto text-center p-8 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl text-white shadow-lg space-y-4">
          <h2 className="text-2xl font-bold">Manage and Brand All Your Links</h2>
          <p className="text-emerald-100 text-sm max-w-md mx-auto">
            Create a free account to organize links into workspaces, attach custom domains, and unlock comprehensive analytics reports.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-white text-emerald-800 font-semibold text-sm rounded-xl shadow-md hover:bg-emerald-50 transition-colors"
            >
              <span>Get Started in Seconds</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* QR Code Modal for Instant Link */}
      {result && (
        <QrModal
          isOpen={qrModalOpen}
          link={result}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </div>
  );
}
