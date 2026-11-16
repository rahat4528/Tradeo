'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Sidebar } from '../components/Sidebar';
import { CreateCardModal } from '../components/CreateCardModal';
import { CardDetailModal } from '../components/CardDetailModal';
import {
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Plus,
  Info,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';

export default function KanbanBoardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [boards, setBoards] = useState<any[]>([]);
  const [currentBoard, setCurrentBoard] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedSwimlaneId, setSelectedSwimlaneId] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
        loadBoardDetails(res.data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadBoardDetails = async (boardId: string) => {
    try {
      const res = await api.get(`/boards/${boardId}`);
      setCurrentBoard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (!cardId || !currentBoard) return;

    // Optimistically update card's column
    setCurrentBoard((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        cards: prev.cards.map((c: any) =>
          c.id === cardId ? { ...c, columnId, daysInColumn: 0 } : c,
        ),
      };
    });

    try {
      await api.patch(`/cards/${cardId}`, { columnId });
      loadBoardDetails(currentBoard.id);
    } catch (err) {
      console.error(err);
      loadBoardDetails(currentBoard.id);
    }
  };

  if (authLoading || (!user && !boards.length)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        Loading process flow board...
      </div>
    );
  }

  // Filter cards
  const cards = currentBoard?.cards || [];
  const columns = currentBoard?.columns || [];
  const swimlanes = currentBoard?.swimlanes || [];

  const filteredCards = cards.filter((card: any) => {
    const matchesSearch = card.title.toLowerCase().includes(search.toLowerCase());
    const matchesSwimlane = selectedSwimlaneId ? card.swimlaneId === selectedSwimlaneId : true;
    return matchesSearch && matchesSwimlane;
  });

  const blockedCount = cards.filter((c: any) => c.isBlocked).length;
  const activeWipCount = cards.filter(
    (c: any) =>
      columns.find((col: any) => col.id === c.columnId && !col.isTerminal && col.order > 0),
  ).length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar
        currentBoard={currentBoard}
        boards={boards}
        onSelectBoard={(id) => loadBoardDetails(id)}
        onOpenCreateCard={() => setIsCreateOpen(true)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              {currentBoard?.title || 'Flow Board'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentBoard?.description || 'Process flow visualizer with WIP limit constraints'}
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                <span className="text-slate-400">Active WIP:</span>
                <span className="font-bold text-emerald-400">{activeWipCount}</span>
              </div>

              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border ${
                  blockedCount > 0
                    ? 'bg-red-950/60 border-red-800 text-red-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Blocked:</span>
                <span className="font-bold">{blockedCount}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow transition"
            >
              + Add Work Item
            </button>
          </div>
        </header>

        {/* Board Filter Controls */}
        <div className="px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search work items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-52"
              />
            </div>

            <select
              value={selectedSwimlaneId}
              onChange={(e) => setSelectedSwimlaneId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Swimlanes</option>
              {swimlanes.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-400">
            Total Cards: <span className="font-semibold text-white">{cards.length}</span>
          </div>
        </div>

        {/* Kanban Columns Grid */}
        <div className="flex-1 overflow-x-auto p-6 flex gap-4 items-start">
          {columns.map((column: any) => {
            const columnCards = filteredCards.filter((c: any) => c.columnId === column.id);
            const isBreached = column.wipLimit !== null && columnCards.length > column.wipLimit;

            return (
              <div
                key={column.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`w-80 shrink-0 rounded-lg p-3 flex flex-col max-h-full border transition select-none ${
                  isBreached
                    ? 'bg-red-950/20 border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {column.title}
                    </span>
                    {column.isTerminal && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 border border-emerald-800 px-1.5 py-0.2 rounded">
                        Done
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {column.wipLimit !== null && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isBreached
                            ? 'bg-red-900 text-red-200 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        WIP: {columnCards.length}/{column.wipLimit}
                      </span>
                    )}
                    {column.wipLimit === null && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {columnCards.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* WIP Breach Alert */}
                {isBreached && (
                  <div className="mb-2 px-2.5 py-1 bg-red-900/60 border border-red-700/80 rounded text-[11px] font-semibold text-red-200 flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    <span>WIP Limit Breached! Reallocate resources.</span>
                  </div>
                )}

                {/* Column Policy / Definition of Done */}
                {column.policy && (
                  <p className="text-[10px] text-slate-400 mb-3 px-1 italic line-clamp-1" title={column.policy}>
                    Policy: {column.policy}
                  </p>
                )}

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {columnCards.map((card: any) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`bg-slate-950 rounded-md p-3 border cursor-pointer hover:border-emerald-500 hover:shadow-md transition group select-none ${
                        card.isBlocked
                          ? 'border-red-800 bg-red-950/20'
                          : 'border-slate-800'
                      }`}
                    >
                      {/* Blocked banner if active */}
                      {card.isBlocked && (
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-red-400 mb-2 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{card.blockReason || 'BLOCKED'}</span>
                        </div>
                      )}

                      <p className="text-xs font-semibold text-slate-100 line-clamp-2 mb-2 leading-relaxed">
                        {card.title}
                      </p>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {card.size}
                          </span>
                          {card.swimlane && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                              {card.swimlane.title}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{card.daysInColumn || 0}d</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {columnCards.length === 0 && (
                    <div className="border border-dashed border-slate-800 rounded p-4 text-center text-xs text-slate-600">
                      Empty column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        boardId={currentBoard?.id}
        columns={columns}
        swimlanes={swimlanes}
        onCardCreated={() => {
          if (currentBoard) loadBoardDetails(currentBoard.id);
        }}
      />

      {/* Card Detail Modal */}
      <CardDetailModal
        cardId={selectedCardId}
        columns={columns}
        swimlanes={swimlanes}
        onClose={() => setSelectedCardId(null)}
        onCardUpdated={() => {
          if (currentBoard) loadBoardDetails(currentBoard.id);
        }}
      />
    </div>
  );
}
