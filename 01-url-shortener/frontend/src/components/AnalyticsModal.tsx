'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { X, BarChart3, Globe, Smartphone, Monitor, Compass, Loader2 } from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  link: any | null;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  link,
  onClose,
}) => {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && link) {
      setLoading(true);
      setError(null);
      api.analytics
        .getForLink(link.id, period)
        .then((res) => setData(res))
        .catch((err) => setError(err.message || 'Failed to load telemetry.'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, link, period]);

  if (!isOpen || !link) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Click Analytics</h3>
              <p className="text-xs text-slate-500 font-mono">/{link.slug}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              {['24h', '7d', '30d', 'all'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    period === p
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
              <p className="text-sm">Calculating real-time telemetry...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && data && (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Clicks
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data.totalClicks.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Unique Visitors
                  </span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {data.uniqueClicks.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Target URL
                  </span>
                  <p className="text-xs text-slate-700 font-mono truncate mt-2" title={data.link.targetUrl}>
                    {data.link.targetUrl}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Created On
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-2">
                    {new Date(data.link.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Click Timeline */}
              <div className="p-5 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                  Activity Timeline
                </h4>
                {data.clicksByDate.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    No clicks recorded for this timeframe yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.clicksByDate.map((item: any) => {
                      const maxClicks = Math.max(...data.clicksByDate.map((i: any) => i.count), 1);
                      const pct = Math.max(8, Math.round((item.count / maxClicks) * 100));
                      return (
                        <div key={item.date} className="flex items-center text-xs space-x-3">
                          <span className="w-20 font-mono text-slate-500">{item.date}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 text-right font-semibold text-slate-700">
                            {item.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Multi-breakdown grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Referrers */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center space-x-2 mb-3">
                    <Compass className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Top Referrers
                    </h4>
                  </div>
                  {data.referrers.length === 0 ? (
                    <p className="text-xs text-slate-400">No referrer data available</p>
                  ) : (
                    <div className="space-y-2">
                      {data.referrers.map((r: any) => (
                        <div key={r.source} className="flex justify-between items-center text-xs">
                          <span className="text-slate-700 font-medium truncate max-w-[200px]">
                            {r.source}
                          </span>
                          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {r.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Countries */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center space-x-2 mb-3">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Top Countries
                    </h4>
                  </div>
                  {data.countries.length === 0 ? (
                    <p className="text-xs text-slate-400">No geographic data</p>
                  ) : (
                    <div className="space-y-2">
                      {data.countries.map((c: any) => (
                        <div key={c.code} className="flex justify-between items-center text-xs">
                          <span className="text-slate-700 font-medium">{c.code}</span>
                          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {c.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Browsers */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center space-x-2 mb-3">
                    <Monitor className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Browsers
                    </h4>
                  </div>
                  {data.browsers.length === 0 ? (
                    <p className="text-xs text-slate-400">No browser data</p>
                  ) : (
                    <div className="space-y-2">
                      {data.browsers.map((b: any) => (
                        <div key={b.name} className="flex justify-between items-center text-xs">
                          <span className="text-slate-700 font-medium">{b.name}</span>
                          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {b.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Devices */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center space-x-2 mb-3">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Device Platforms
                    </h4>
                  </div>
                  {data.devices.length === 0 ? (
                    <p className="text-xs text-slate-400">No device data</p>
                  ) : (
                    <div className="space-y-2">
                      {data.devices.map((d: any) => (
                        <div key={d.name} className="flex justify-between items-center text-xs">
                          <span className="text-slate-700 font-medium">{d.name}</span>
                          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {d.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
