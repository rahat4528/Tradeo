'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { Terminal, Search, Plus, RefreshCw, X } from 'lucide-react';

interface LogEntry {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  serviceId: string;
  createdAt: string;
  service: { id: string; name: string };
}

interface Service {
  id: string;
  name: string;
}

export default function LogsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Ingest Log Modal
  const [showModal, setShowModal] = useState(false);
  const [modalServiceId, setModalServiceId] = useState('');
  const [modalLevel, setModalLevel] = useState<'INFO' | 'WARN' | 'ERROR' | 'DEBUG'>('INFO');
  const [modalMessage, setModalMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data || []);
      if (res.data?.length > 0 && !modalServiceId) {
        setModalServiceId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedServiceId !== 'ALL') params.serviceId = selectedServiceId;
      if (selectedLevel !== 'ALL') params.level = selectedLevel;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/logs', { params });
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchServices();
      fetchLogs();
    }
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/logs', {
        serviceId: modalServiceId,
        level: modalLevel,
        message: modalMessage,
      });
      setShowModal(false);
      setModalMessage('');
      await fetchLogs();
    } catch (err) {
      alert('Failed to emit log entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Log Aggregator & Observability Stream</h1>
            <p className="text-slate-400 text-sm mt-1">
              Centralized distributed application logs with live query filtering and severity classification.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchLogs()}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Emit Log Event
            </button>
          </div>
        </header>

        {/* Filters and Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search log messages or exceptions (e.g. 500, timeout)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Service:</label>
              <select
                value={selectedServiceId}
                onChange={e => setSelectedServiceId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Services</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Level:</label>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Levels</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              Filter Stream
            </button>
          </form>
        </div>

        {/* Console Log Terminal Window */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-slate-400 ml-2 font-sans font-semibold">Live Stream Output</span>
            </div>
            <div className="text-xs text-slate-500 font-sans">
              Displaying {logs.length} events
            </div>
          </div>

          <div className="p-4 h-[600px] overflow-y-auto space-y-2 select-text">
            {loading ? (
              <div className="text-slate-500 py-12 text-center font-sans">Streaming logs from cluster...</div>
            ) : logs.length === 0 ? (
              <div className="text-slate-500 py-12 text-center font-sans">
                <Terminal className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                No matching log entries found.
              </div>
            ) : (
              logs.map(log => {
                const dateStr = new Date(log.createdAt).toISOString();
                let badgeClass = 'text-sky-400 bg-sky-950/60 border-sky-800/50';
                if (log.level === 'WARN') badgeClass = 'text-amber-400 bg-amber-950/60 border-amber-800/50';
                if (log.level === 'ERROR') badgeClass = 'text-rose-400 bg-rose-950/60 border-rose-800/50';
                if (log.level === 'DEBUG') badgeClass = 'text-slate-400 bg-slate-900 border-slate-800';

                return (
                  <div key={log.id} className="flex items-start gap-3 hover:bg-slate-900/60 p-1.5 rounded transition-colors">
                    <span className="text-slate-500 shrink-0">{dateStr}</span>
                    <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold shrink-0 ${badgeClass}`}>
                      {log.level}
                    </span>
                    <span className="text-indigo-300 shrink-0">[{log.service?.name}]</span>
                    <span className="text-slate-200 break-all">{log.message}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Emit Log Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Emit Log Entry</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLog} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Source Service</label>
                  <select
                    value={modalServiceId}
                    onChange={e => setModalServiceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Severity Level</label>
                  <select
                    value={modalLevel}
                    onChange={e => setModalLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                    <option value="DEBUG">DEBUG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Log Message</label>
                  <textarea
                    rows={4}
                    value={modalMessage}
                    onChange={e => setModalMessage(e.target.value)}
                    placeholder="e.g. GET /api/v1/orders 200 OK - 34ms"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
                  >
                    {submitting ? 'Emitting...' : 'Emit Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
