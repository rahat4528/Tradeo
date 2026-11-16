'use client';

import React, { useEffect, useState } from 'react';
import { X, Trash2, AlertTriangle, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

interface CardDetailModalProps {
  cardId: string | null;
  columns: any[];
  swimlanes: any[];
  onClose: () => void;
  onCardUpdated: () => void;
}

export function CardDetailModal({
  cardId,
  columns,
  swimlanes,
  onClose,
  onCardUpdated,
}: CardDetailModalProps) {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    if (cardId) {
      loadCard(cardId);
    } else {
      setCard(null);
    }
  }, [cardId]);

  const loadCard = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/cards/${id}`);
      setCard(res.data);
      setBlockReason(res.data.blockReason || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleColumnChange = async (columnId: string) => {
    if (!card) return;
    try {
      await api.patch(`/cards/${card.id}`, { columnId });
      loadCard(card.id);
      onCardUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwimlaneChange = async (swimlaneId: string) => {
    if (!card) return;
    try {
      await api.patch(`/cards/${card.id}`, { swimlaneId: swimlaneId || null });
      loadCard(card.id);
      onCardUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!card) return;
    try {
      await api.patch(`/cards/${card.id}`, { priority });
      loadCard(card.id);
      onCardUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBlock = async () => {
    if (!card) return;
    const willBlock = !card.isBlocked;
    try {
      await api.patch(`/cards/${card.id}/block`, {
        isBlocked: willBlock,
        blockReason: willBlock ? blockReason || 'Blocked by external dependency' : undefined,
      });
      loadCard(card.id);
      onCardUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!card || !confirm('Delete this card?')) return;
    try {
      await api.delete(`/cards/${card.id}`);
      onCardUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!cardId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                card?.priority === 'URGENT'
                  ? 'bg-red-950/80 text-red-400 border border-red-800'
                  : card?.priority === 'HIGH'
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {card?.priority}
            </span>
            <span className="text-xs font-mono text-slate-400">Size: {card?.size}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {loading || !card ? (
          <div className="p-12 text-center text-slate-500">Loading work item...</div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            <div>
              <h1 className="text-lg font-bold text-white leading-snug">{card.title}</h1>
            </div>

            {/* Blocker Alert Banner / Control */}
            <div
              className={`rounded-lg p-4 border transition ${
                card.isBlocked
                  ? 'bg-red-950/40 border-red-800/80'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle
                    className={`w-4 h-4 ${card.isBlocked ? 'text-red-400' : 'text-slate-500'}`}
                  />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      card.isBlocked ? 'text-red-300' : 'text-slate-400'
                    }`}
                  >
                    {card.isBlocked ? 'Work Item Blocked' : 'Blocker Status: Clear'}
                  </span>
                </div>
                <button
                  onClick={handleToggleBlock}
                  className={`text-xs px-2.5 py-1 rounded font-medium transition ${
                    card.isBlocked
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600/80 hover:bg-red-600 text-white'
                  }`}
                >
                  {card.isBlocked ? 'Resolve Blocker' : 'Mark as Blocked'}
                </button>
              </div>

              {card.isBlocked ? (
                <p className="text-xs text-red-200">{card.blockReason}</p>
              ) : (
                <input
                  type="text"
                  placeholder="Specify blocker reason if marking blocked..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              )}
            </div>

            {/* Lean Aging & Cycle Metrics */}
            <div className="grid grid-cols-3 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Days in Column
                  </span>
                  <span className="text-sm font-bold text-white">
                    {card.daysInColumn} {card.daysInColumn === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Total Age
                  </span>
                  <span className="text-sm font-bold text-white">
                    {card.totalAgeDays} {card.totalAgeDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 ${
                    card.completedAt ? 'text-emerald-400' : 'text-slate-600'
                  }`}
                />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Process State
                  </span>
                  <span className="text-sm font-bold text-white">
                    {card.completedAt ? 'Completed' : card.startedAt ? 'In Flight' : 'Queued'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Description & Criteria
              </h3>
              <div className="bg-slate-950 rounded-md p-4 text-xs text-slate-300 whitespace-pre-wrap border border-slate-800 min-h-[60px]">
                {card.description || 'No description provided.'}
              </div>
            </div>

            {/* Placement Controls */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Column
                </label>
                <select
                  value={card.columnId}
                  onChange={(e) => handleColumnChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Swimlane
                </label>
                <select
                  value={card.swimlaneId || ''}
                  onChange={(e) => handleSwimlaneChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {swimlanes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Priority
                </label>
                <select
                  value={card.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="URGENT">Urgent (Expedite)</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
