'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import {
  Target,
  Plus,
  DollarSign,
  TrendingUp,
  Award,
  ChevronRight,
  Building2,
  User,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CreateDealModal } from '../components/CreateDealModal';

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string | null;
  company?: { id: string; name: string } | null;
  contact?: { id: string; firstName: string; lastName: string } | null;
}

interface ColumnData {
  stage: string;
  dealCount: number;
  totalValue: number;
  weightedValue: number;
  deals: Deal[];
}

interface PipelineResponse {
  grandTotal: number;
  weightedForecast: number;
  columns: ColumnData[];
}

interface AnalyticsData {
  totalPipelineValue: number;
  weightedForecast: number;
  totalWonRevenue: number;
  winRatePercentage: number;
}

const STAGE_LABELS: Record<string, { label: string; color: string; border: string }> = {
  LEAD: { label: 'Lead', color: 'bg-slate-100 text-slate-700', border: 'border-slate-300' },
  QUALIFIED: { label: 'Qualified', color: 'bg-blue-100 text-blue-700', border: 'border-blue-400' },
  PROPOSAL: { label: 'Proposal', color: 'bg-purple-100 text-purple-700', border: 'border-purple-400' },
  NEGOTIATION: { label: 'Negotiation', color: 'bg-amber-100 text-amber-700', border: 'border-amber-400' },
  CLOSED_WON: { label: 'Closed Won', color: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-500' },
  CLOSED_LOST: { label: 'Closed Lost', color: 'bg-red-100 text-red-800', border: 'border-red-400' },
};

const STAGE_ORDER = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

export default function PipelineDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [pipeline, setPipeline] = useState<PipelineResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [pipeData, analyticsData, compData, contData] = await Promise.all([
        apiFetch('/deals/pipeline'),
        apiFetch('/analytics/dashboard'),
        apiFetch('/companies'),
        apiFetch('/contacts'),
      ]);
      setPipeline(pipeData);
      setAnalytics(analyticsData);
      setCompanies(Array.isArray(compData) ? compData : []);
      setContacts(Array.isArray(contData) ? contData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleAdvanceStage = async (dealId: string, currentStage: string) => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 2) { // up to CLOSED_WON
      const nextStage = STAGE_ORDER[currentIndex + 1];
      try {
        await apiFetch(`/deals/${dealId}/stage`, {
          method: 'PATCH',
          body: JSON.stringify({ stage: nextStage }),
        });
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Failed to update deal stage');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200 my-8 px-6">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">B2B Deal Pipeline & Revenue CRM</h2>
        <p className="text-slate-600 max-w-lg mx-auto mb-6 text-sm">
          Track deals across multiple sales stages, calculate weighted revenue forecasts, log customer meetings, and manage account relationships.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/login"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
          >
            Sign In to Console
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
          >
            Create CRM Workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline & Deals</h1>
          <p className="text-sm text-slate-500">Track deal velocity, probability weighting, and pipeline revenue</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      {/* KPI Forecast Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Active Pipeline</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.totalPipelineValue)}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Weighted Forecast</div>
              <div className="text-2xl font-bold text-indigo-700">{formatCurrency(analytics.weightedForecast)}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Closed Won Revenue</div>
              <div className="text-2xl font-bold text-emerald-700">{formatCurrency(analytics.totalWonRevenue)}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Win Rate</div>
              <div className="text-2xl font-bold text-slate-900">{analytics.winRatePercentage}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Kanban Columns */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px]">
          {loading ? (
            <div className="w-full text-center py-12 text-slate-400">Loading pipeline stages...</div>
          ) : !pipeline ? null : (
            pipeline.columns.map((col) => {
              const meta = STAGE_LABELS[col.stage] || { label: col.stage, color: 'bg-slate-100 text-slate-700', border: 'border-slate-300' };

              return (
                <div key={col.stage} className="flex-1 bg-slate-100/70 rounded-xl p-3 flex flex-col min-w-[220px] max-w-[280px]">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">({col.dealCount})</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {formatCurrency(col.totalValue)}
                    </span>
                  </div>

                  {/* Deals Stack */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {col.deals.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400 italic">No deals</div>
                    ) : (
                      col.deals.map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-purple-300 transition-all space-y-2.5"
                        >
                          <div className="font-semibold text-slate-900 text-sm leading-snug">
                            {deal.title}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 font-mono text-sm">
                              {formatCurrency(deal.value)}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-[10px]">
                              {deal.probability}% prob
                            </span>
                          </div>

                          {deal.company && (
                            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{deal.company.name}</span>
                            </div>
                          )}

                          {deal.contact && (
                            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{deal.contact.firstName} {deal.contact.lastName}</span>
                            </div>
                          )}

                          {/* Stage progression action */}
                          {deal.stage !== 'CLOSED_WON' && deal.stage !== 'CLOSED_LOST' && (
                            <div className="pt-2 border-t border-slate-100 flex justify-end">
                              <button
                                onClick={() => handleAdvanceStage(deal.id, deal.stage)}
                                className="flex items-center space-x-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors"
                              >
                                <span>Advance</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <CreateDealModal
        isOpen={isModalOpen}
        companies={companies}
        contacts={contacts}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
