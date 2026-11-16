'use client';

import React from 'react';
import { apiClient } from '@/lib/api';
import { X, Trash2, Clock } from 'lucide-react';
import { formatTime, formatBytes } from '@/lib/utils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: any[];
  onSelectHistory: (item: any) => void;
  onRefresh: () => void;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onRefresh,
}: HistoryDrawerProps) {
  if (!isOpen) return null;

  const handleClear = async () => {
    if (!confirm('Clear all request execution history?')) return;
    try {
      await apiClient.delete('/history');
      onRefresh();
    } catch (err: any) {
      alert('Failed to clear history');
    }
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400 bg-green-950/40 border-green-800/50';
    if (status >= 300 && status < 400) return 'text-blue-400 bg-blue-950/40 border-blue-800/50';
    if (status >= 400 && status < 500) return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/50';
    return 'text-red-400 bg-red-950/40 border-red-800/50';
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-[#161b22] border-l border-[#30363d] shadow-2xl flex flex-col">
      <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">Execution History</span>
        </div>
        <div className="flex items-center space-x-1">
          {history.length > 0 && (
            <button
              onClick={handleClear}
              title="Clear History"
              className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-[#21262d]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#21262d]">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            No requests executed yet.
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className="p-2.5 rounded bg-[#0d1117] border border-[#30363d] hover:border-blue-500 cursor-pointer transition text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-300">{item.method}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getStatusBadge(item.responseStatus)}`}>
                  {item.responseStatus} {item.responseStatusText}
                </span>
              </div>
              <p className="text-gray-400 truncate text-[11px] font-mono">{item.url}</p>
              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-[#21262d]">
                <span>{formatTime(item.responseTimeMs)}</span>
                <span>{formatBytes(item.responseSizeBytes)}</span>
                <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
