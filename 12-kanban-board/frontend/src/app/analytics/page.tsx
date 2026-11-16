'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { Sidebar } from '../../components/Sidebar';
import {
  Clock,
  Zap,
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [boards, setBoards] = useState<any[]>([]);
  const [currentBoard, setCurrentBoard] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user]);

  const loadBoards = async () => {
    try {
      const res = await api.get('/boards');
      setBoards(res.data);
      if (res.data.length > 0) {
        loadBoardAnalytics(res.data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadBoardAnalytics = async (boardId: string) => {
    setLoading(true);
    try {
      const boardRes = await api.get(`/boards/${boardId}`);
      setCurrentBoard(boardRes.data);

      const analyticsRes = await api.get(`/boards/${boardId}/analytics`);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !boards.length)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        Loading analytics...
      </div>
    );
  }

  const cfd = analytics?.cfd || [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar
        currentBoard={currentBoard}
        boards={boards}
        onSelectBoard={(id) => loadBoardAnalytics(id)}
        onOpenCreateCard={() => router.push('/')}
      />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              Lean Flow Analytics & Cumulative Flow Diagram
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Cycle time optimization, lead time predictability, and WIP bottleneck telemetry.
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Avg Cycle Time
                </span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {analytics?.averageCycleTimeDays || 0} <span className="text-sm font-normal text-slate-400">days</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">From active start to production deployment</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Avg Lead Time
                </span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {analytics?.averageLeadTimeDays || 0} <span className="text-sm font-normal text-slate-400">days</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">From initial ticket creation to delivery</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Active WIP Load
                </span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {analytics?.activeWipCount || 0} <span className="text-sm font-normal text-slate-400">items</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Concurrent in-flight work items</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Blocked Items
                </span>
                <AlertTriangle
                  className={`w-4 h-4 ${
                    (analytics?.blockedCount || 0) > 0 ? 'text-red-400' : 'text-slate-500'
                  }`}
                />
              </div>
              <div className="text-2xl font-bold text-white">
                {analytics?.blockedCount || 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Stalled awaiting external dependencies</p>
            </div>
          </div>

          {/* Cumulative Flow Diagram (CFD) Visualizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Cumulative Flow Distribution</h2>
              </div>
              <span className="text-xs text-slate-400">
                Total throughput: <strong className="text-white">{analytics?.completedCardsCount || 0} items</strong>
              </span>
            </div>

            {/* Visual CFD Stacked Horizontal Bar */}
            <div className="space-y-4">
              <div className="w-full h-8 rounded-lg overflow-hidden flex bg-slate-950 border border-slate-800">
                {cfd.map((stage: any, index: number) => {
                  const colors = [
                    'bg-slate-600',
                    'bg-blue-600',
                    'bg-amber-600',
                    'bg-emerald-600',
                    'bg-purple-600',
                  ];
                  const percentage =
                    analytics?.totalCards > 0
                      ? (stage.cardCount / analytics.totalCards) * 100
                      : 0;

                  return (
                    <div
                      key={stage.columnId}
                      style={{ width: `${Math.max(percentage, stage.cardCount > 0 ? 5 : 0)}%` }}
                      className={`${colors[index % colors.length]} h-full transition-all flex items-center justify-center text-[10px] font-bold text-white overflow-hidden`}
                      title={`${stage.title}: ${stage.cardCount} cards (${percentage.toFixed(0)}%)`}
                    >
                      {stage.cardCount > 0 && `${stage.cardCount}`}
                    </div>
                  );
                })}
              </div>

              {/* Legend & Breakdown Table */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                {cfd.map((stage: any, index: number) => {
                  const colors = [
                    'bg-slate-600',
                    'bg-blue-600',
                    'bg-amber-600',
                    'bg-emerald-600',
                    'bg-purple-600',
                  ];
                  const isBreached =
                    stage.wipLimit !== null && stage.cardCount > stage.wipLimit;

                  return (
                    <div
                      key={stage.columnId}
                      className="bg-slate-950 border border-slate-800 rounded-md p-3"
                    >
                      <div className="flex items-center space-x-2 mb-1.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${colors[index % colors.length]}`}
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {stage.title}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-400">Cards:</span>
                        <span className="font-bold text-white">{stage.cardCount}</span>
                      </div>

                      <div className="flex items-baseline justify-between text-xs mt-1">
                        <span className="text-slate-400">WIP Limit:</span>
                        <span
                          className={`font-semibold ${
                            isBreached ? 'text-red-400' : 'text-slate-300'
                          }`}
                        >
                          {stage.wipLimit !== null ? stage.wipLimit : 'None'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
