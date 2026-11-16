'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { GitCommit, Rocket, CheckCircle2, XCircle, Clock, Plus, X, RefreshCw, Layers } from 'lucide-react';

interface Deployment {
  id: string;
  version: string;
  commitSha: string;
  environment: 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'ROLLED_BACK';
  deployer: string;
  durationSeconds?: number;
  createdAt: string;
  service: { id: string; name: string };
}

interface Service {
  id: string;
  name: string;
}

export default function DeploymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [envFilter, setEnvFilter] = useState('ALL');

  // Trigger Deployment Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [version, setVersion] = useState('v1.0.1');
  const [commitSha, setCommitSha] = useState('a1b2c3d');
  const [environment, setEnvironment] = useState<'PRODUCTION' | 'STAGING' | 'DEVELOPMENT'>('PRODUCTION');
  const [status, setStatus] = useState<'SUCCESS' | 'IN_PROGRESS' | 'FAILED'>('SUCCESS');
  const [durationSeconds, setDurationSeconds] = useState('45');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deployRes, servicesRes] = await Promise.all([
        api.get('/deployments'),
        api.get('/services'),
      ]);
      setDeployments(deployRes.data || []);
      setServices(servicesRes.data || []);
      if (servicesRes.data?.length > 0 && !selectedServiceId) {
        setSelectedServiceId(servicesRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load deployments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleRecordDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/deployments', {
        serviceId: selectedServiceId,
        version,
        commitSha,
        environment,
        status,
        deployer: user?.name || 'DevOps Engineer',
        durationSeconds: parseInt(durationSeconds, 10) || 30,
      });
      setShowModal(false);
      await fetchData();
    } catch (err) {
      alert('Failed to trigger deployment record');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = deployments.filter(dep => {
    if (envFilter === 'ALL') return true;
    return dep.environment === envFilter;
  });

  const totalSuccessful = deployments.filter(d => d.status === 'SUCCESS').length;
  const totalFailed = deployments.filter(d => d.status === 'FAILED').length;
  const successRate = deployments.length > 0 ? Math.round((totalSuccessful / deployments.length) * 100) : 100;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Deployments & CI/CD Pipeline</h1>
            <p className="text-slate-400 text-sm mt-1">
              Multi-environment release tracker, commit provenance, and deployment frequency analytics.
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
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Rocket className="w-4 h-4" />
              Record Release
            </button>
          </div>
        </header>

        {/* Deployment KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Total Deployments</span>
              <Rocket className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold text-white">{deployments.length}</div>
            <p className="text-xs text-slate-500 mt-1">Across all environments</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Success Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">{successRate}%</div>
            <p className="text-xs text-slate-500 mt-1">{totalSuccessful} successful releases</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Failed Releases</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-bold text-rose-400">{totalFailed}</div>
            <p className="text-xs text-slate-500 mt-1">Rollback triggers invoked</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Avg Duration</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-bold text-sky-400">42s</div>
            <p className="text-xs text-slate-500 mt-1">CI/CD execution speed</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {['ALL', 'PRODUCTION', 'STAGING', 'DEVELOPMENT'].map(env => (
              <button
                key={env}
                onClick={() => setEnvFilter(env)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  envFilter === env
                    ? 'bg-slate-800 text-white border border-slate-600'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">Showing {filtered.length} releases</span>
        </div>

        {/* Deployments Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Commit</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deployed By</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading deployment history...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No deployment history found for this environment.
                  </td>
                </tr>
              ) : (
                filtered.map(dep => (
                  <tr key={dep.id} className="hover:bg-slate-850">
                    <td className="py-3 px-4 font-semibold text-white">{dep.service?.name}</td>
                    <td className="py-3 px-4 font-mono text-indigo-400">{dep.version}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        <GitCommit className="w-3 h-3 text-slate-400" />
                        {dep.commitSha}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          dep.environment === 'PRODUCTION'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : dep.environment === 'STAGING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {dep.environment}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
                          dep.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : dep.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-400'
                            : dep.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-purple-500/10 text-purple-400'
                        }`}
                      >
                        {dep.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                        {dep.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                        {dep.status === 'IN_PROGRESS' && <Clock className="w-3 h-3" />}
                        {dep.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">{dep.deployer}</td>
                    <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                      {dep.durationSeconds ? `${dep.durationSeconds}s` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-500">
                      {new Date(dep.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Record Release Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Record Service Deployment</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordDeployment} className="space-y-4">
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Release Version</label>
                    <input
                      type="text"
                      value={version}
                      onChange={e => setVersion(e.target.value)}
                      placeholder="v2.1.0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Git Commit SHA</label>
                    <input
                      type="text"
                      value={commitSha}
                      onChange={e => setCommitSha(e.target.value)}
                      placeholder="e.g. 7c9f1a2"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Environment</label>
                    <select
                      value={environment}
                      onChange={e => setEnvironment(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="PRODUCTION">Production</option>
                      <option value="STAGING">Staging</option>
                      <option value="DEVELOPMENT">Development</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="SUCCESS">Success</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Duration (Seconds)</label>
                  <input
                    type="number"
                    value={durationSeconds}
                    onChange={e => setDurationSeconds(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                    {submitting ? 'Recording...' : 'Record Deployment'}
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
