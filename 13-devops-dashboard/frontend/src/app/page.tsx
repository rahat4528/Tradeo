'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Sidebar } from '../components/Sidebar';
import { AddServiceModal } from '../components/AddServiceModal';
import { MetricChart } from '../components/MetricChart';
import {
  Server,
  Activity,
  Cpu,
  Layers,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export default function DevOpsOverviewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [services, setServices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedEnv, setSelectedEnv] = useState<string>('ALL');
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedEnv]);

  const loadData = async () => {
    try {
      const envParam = selectedEnv !== 'ALL' ? { environment: selectedEnv } : {};
      const [servicesRes, summaryRes] = await Promise.all([
        api.get('/services', { params: envParam }),
        api.get('/metrics/summary'),
      ]);
      setServices(servicesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        Loading infrastructure telemetry...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar onOpenAddService={() => setIsAddServiceOpen(true)} />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              Infrastructure & Services Command Overview
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated health checks, microservice uptime tracking, and timeseries load metrics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddServiceOpen(true)}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-xs font-semibold shadow transition"
            >
              + Register Service
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Summary Metric Tiles */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Service Fleet</span>
                <Server className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {summary?.totalServices || 0}
              </div>
              <div className="flex items-center space-x-2 text-xs mt-1">
                <span className="text-emerald-400 font-semibold">{summary?.healthyCount || 0} Healthy</span>
                <span>·</span>
                <span className="text-amber-400 font-semibold">{summary?.degradedCount || 0} Degraded</span>
                <span>·</span>
                <span className="text-red-400 font-semibold">{summary?.downCount || 0} Down</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg CPU Load</span>
                <Cpu className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {summary?.avgCpuPercent || 0}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Container cluster average</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Memory Load</span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {summary?.avgMemoryPercent || 0}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Resident memory consumption</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total RPS & Latency</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {summary?.totalRequestRate || 0} <span className="text-xs font-normal text-slate-400">RPS</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                p95 avg latency: <strong className="text-slate-300">{summary?.avgLatencyMs || 0} ms</strong>
              </p>
            </div>
          </div>

          {/* Environment Filter Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            {['ALL', 'PRODUCTION', 'STAGING', 'DEVELOPMENT'].map((env) => (
              <button
                key={env}
                onClick={() => setSelectedEnv(env)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  selectedEnv === env
                    ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-800/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {env}
              </button>
            ))}
          </div>

          {/* Monitored Services Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Active Monitored Services ({services.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3">Service Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Uptime</th>
                    <th className="px-4 py-3">Environment</th>
                    <th className="px-4 py-3">Probe Interval</th>
                    <th className="px-6 py-3">Telemetry Snapshots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {services.map((service) => {
                    const latestMetric = service.metrics?.[0];
                    const cpuSample = latestMetric ? [latestMetric.cpuPercent * 0.9, latestMetric.cpuPercent] : [35, 42];
                    const latencySample = latestMetric ? [latestMetric.latencyMs * 0.95, latestMetric.latencyMs] : [30, 38];

                    return (
                      <tr key={service.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4 font-semibold text-white">
                          <div className="flex items-center space-x-2">
                            <span>{service.name}</span>
                            <a
                              href={service.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-cyan-400"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                            {service.url}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-bold ${
                              service.status === 'HEALTHY'
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                : service.status === 'DEGRADED'
                                ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                : 'bg-red-950/80 text-red-400 border border-red-800 animate-pulse'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                service.status === 'HEALTHY'
                                  ? 'bg-emerald-400'
                                  : service.status === 'DEGRADED'
                                  ? 'bg-amber-400'
                                  : 'bg-red-400'
                              }`}
                            />
                            <span>{service.status}</span>
                          </span>
                        </td>

                        <td className="px-4 py-4 font-mono font-semibold text-slate-200">
                          {service.uptimePercent}%
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-[10px] font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                            {service.environment}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {service.intervalSeconds}s
                        </td>

                        <td className="px-6 py-4 w-48">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>CPU:</span>
                              <span className="font-mono text-slate-200">{latestMetric?.cpuPercent?.toFixed(1) || '0'}%</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Latency:</span>
                              <span className="font-mono text-slate-200">{latestMetric?.latencyMs?.toFixed(0) || '0'} ms</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {services.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No services registered for this environment. Click "Register Service" to begin monitoring.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <AddServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        onServiceAdded={() => loadData()}
      />
    </div>
  );
}
