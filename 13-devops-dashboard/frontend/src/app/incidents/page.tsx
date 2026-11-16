'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { AlertCircle, ShieldAlert, CheckCircle, Bell, Plus, Trash2, X, RefreshCw } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description?: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';
  service: { id: string; name: string };
  triggeredAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

interface AlertRule {
  id: string;
  metricType: string;
  operator: string;
  threshold: number;
  severity: string;
  service: { id: string; name: string };
  createdAt: string;
}

interface Service {
  id: string;
  name: string;
}

export default function IncidentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'incidents' | 'rules'>('incidents');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // New Rule Modal
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [metricType, setMetricType] = useState('CPU');
  const [operator, setOperator] = useState('GT');
  const [threshold, setThreshold] = useState('85');
  const [severity, setSeverity] = useState('CRITICAL');

  // Resolve Modal
  const [resolvingIncident, setResolvingIncident] = useState<Incident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incidentsRes, rulesRes, servicesRes] = await Promise.all([
        api.get('/incidents'),
        api.get('/alerts'),
        api.get('/services'),
      ]);
      setIncidents(incidentsRes.data || []);
      setAlertRules(rulesRes.data || []);
      setServices(servicesRes.data || []);
      if (servicesRes.data?.length > 0 && !selectedServiceId) {
        setSelectedServiceId(servicesRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load incidents and alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAcknowledge = async (id: string) => {
    try {
      setActionLoading(true);
      await api.patch(`/incidents/${id}`, { status: 'ACKNOWLEDGED' });
      await fetchData();
    } catch (err) {
      alert('Failed to acknowledge incident');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIncident) return;
    try {
      setActionLoading(true);
      await api.patch(`/incidents/${resolvingIncident.id}`, {
        status: 'RESOLVED',
        resolutionNotes,
      });
      setResolvingIncident(null);
      setResolutionNotes('');
      await fetchData();
    } catch (err) {
      alert('Failed to resolve incident');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post('/alerts', {
        serviceId: selectedServiceId,
        metricType,
        operator,
        threshold: parseFloat(threshold),
        severity,
      });
      setShowRuleModal(false);
      await fetchData();
    } catch (err) {
      alert('Failed to create alert rule');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert rule?')) return;
    try {
      await api.delete(`/alerts/${id}`);
      setAlertRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete alert rule');
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    if (statusFilter === 'ALL') return true;
    return inc.status === statusFilter;
  });

  const activeCount = incidents.filter(i => i.status === 'TRIGGERED').length;
  const ackCount = incidents.filter(i => i.status === 'ACKNOWLEDGED').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Incident Response & Alerts</h1>
            <p className="text-slate-400 text-sm mt-1">
              Automated threshold triggers, incident lifecycle tracking, and SLA escalation policies.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchData()}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowRuleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Alert Rule
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Triggered Incidents</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-bold text-rose-400">{activeCount}</div>
            <p className="text-xs text-slate-500 mt-1">Requires immediate attention</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Acknowledged</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400">{ackCount}</div>
            <p className="text-xs text-slate-500 mt-1">Investigating engineers assigned</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Resolved</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">{resolvedCount}</div>
            <p className="text-xs text-slate-500 mt-1">Successfully mitigated</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Active Alert Rules</span>
              <Bell className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold text-indigo-400">{alertRules.length}</div>
            <p className="text-xs text-slate-500 mt-1">Automated monitors active</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'incidents'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Incidents Timeline ({filteredIncidents.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'rules'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Configured Alert Rules ({alertRules.length})
          </button>
        </div>

        {activeTab === 'incidents' ? (
          <div>
            {/* Filter Pills */}
            <div className="flex gap-2 mb-4">
              {['ALL', 'TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white border border-slate-600'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading incident data...</div>
            ) : filteredIncidents.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-base font-medium">All clear! No incidents matching criteria.</p>
                <p className="text-xs text-slate-500 mt-1">Services are operating within normal SLO parameters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIncidents.map(inc => (
                  <div
                    key={inc.id}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            inc.severity === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : inc.severity === 'WARNING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {inc.severity}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            inc.status === 'TRIGGERED'
                              ? 'bg-rose-500/20 text-rose-300'
                              : inc.status === 'ACKNOWLEDGED'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {inc.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {inc.service?.name}
                        </span>
                      </div>
                      <h3 className="text-base font-medium text-white mt-2">{inc.title}</h3>
                      {inc.description && (
                        <p className="text-sm text-slate-400 mt-1">{inc.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                        <span>Triggered: {new Date(inc.triggeredAt).toLocaleString()}</span>
                        {inc.acknowledgedBy && (
                          <span>Ack: {inc.acknowledgedBy} ({new Date(inc.acknowledgedAt!).toLocaleTimeString()})</span>
                        )}
                        {inc.resolutionNotes && (
                          <span className="text-emerald-400">Notes: {inc.resolutionNotes}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {inc.status === 'TRIGGERED' && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleAcknowledge(inc.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {inc.status !== 'RESOLVED' && (
                        <button
                          disabled={actionLoading}
                          onClick={() => setResolvingIncident(inc)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Metric</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Threshold</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {alertRules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No alert rules defined. Create one to automatically detect service degradation.
                      </td>
                    </tr>
                  ) : (
                    alertRules.map(rule => (
                      <tr key={rule.id} className="hover:bg-slate-850">
                        <td className="py-3 px-4 font-medium text-white">{rule.service?.name}</td>
                        <td className="py-3 px-4 text-indigo-400 font-mono">{rule.metricType}</td>
                        <td className="py-3 px-4">{rule.operator === 'GT' ? 'Greater than (>)' : 'Less than (<)'}</td>
                        <td className="py-3 px-4 font-mono font-bold">{rule.threshold}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              rule.severity === 'CRITICAL'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {rule.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Rule Modal */}
        {showRuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Create Alert Rule</h2>
                <button
                  onClick={() => setShowRuleModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Service</label>
                  <select
                    value={selectedServiceId}
                    onChange={e => setSelectedServiceId(e.target.value)}
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
                  <label className="block text-xs font-medium text-slate-400 mb-1">Metric Type</label>
                  <select
                    value={metricType}
                    onChange={e => setMetricType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CPU">CPU Usage (%)</option>
                    <option value="MEMORY">Memory Usage (%)</option>
                    <option value="LATENCY">Latency (ms)</option>
                    <option value="ERROR_RATE">Error Rate (%)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Operator</label>
                    <select
                      value={operator}
                      onChange={e => setOperator(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="GT">&gt; Greater Than</option>
                      <option value="LT">&lt; Less Than</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Threshold Value</label>
                    <input
                      type="number"
                      step="any"
                      value={threshold}
                      onChange={e => setThreshold(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="WARNING">Warning</option>
                    <option value="INFO">Info</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRuleModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
                  >
                    {actionLoading ? 'Creating...' : 'Save Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resolve Modal */}
        {resolvingIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Resolve Incident</h2>
                <button
                  onClick={() => setResolvingIncident(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleResolve} className="space-y-4">
                <p className="text-sm text-slate-300">
                  Resolving: <span className="font-semibold text-white">{resolvingIncident.title}</span>
                </p>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Resolution Post-Mortem / Notes</label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={e => setResolutionNotes(e.target.value)}
                    placeholder="Root cause identified: memory leak fixed in release v1.4.3..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResolvingIncident(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium"
                  >
                    {actionLoading ? 'Resolving...' : 'Confirm Resolution'}
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
