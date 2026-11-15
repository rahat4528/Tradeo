'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';
import { X, History, RotateCcw, Clock, Check, Loader2 } from 'lucide-react';

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  snippetId: string | null;
  onClose: () => void;
  onRolledBack: (updated: any) => void;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  isOpen,
  snippetId,
  onClose,
  onRolledBack,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    if (isOpen && snippetId) {
      setLoading(true);
      api.snippets
        .getHistory(snippetId)
        .then((data) => {
          setHistory(data || []);
          if (data && data.length > 0) {
            setSelectedVersion(data[0]);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, snippetId]);

  if (!isOpen || !snippetId) return null;

  const handleRollback = async (versionId: string) => {
    if (window.confirm('Are you sure you want to rollback to this historical revision?')) {
      setRollingBack(true);
      try {
        const updated = await api.snippets.rollback(snippetId, versionId);
        onRolledBack(updated);
        onClose();
      } catch (err: any) {
        alert(err.message || 'Failed to rollback version');
      } finally {
        setRollingBack(false);
      }
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-editor-surface border-l border-editor-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="h-14 px-4 border-b border-editor-border flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm text-white">Revision Snapshots</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Timeline List */}
        <div className="w-48 border-r border-editor-border overflow-y-auto divide-y divide-editor-border/40 text-xs">
          {loading ? (
            <div className="p-4 text-center text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-indigo-400" />
              <span>Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <p className="p-4 text-center text-slate-500">No revisions found.</p>
          ) : (
            history.map((ver) => {
              const isSelected = selectedVersion?.id === ver.id;
              return (
                <div
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-editor-dark text-white font-semibold' : 'text-slate-400 hover:bg-editor-dark/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-300">v{ver.versionNumber}</span>
                    <span className="text-[10px] text-slate-500">{formatDate(ver.createdAt)}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 truncate">
                    {ver.summary || 'Content revision'}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Version Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-editor-dark p-4">
          {selectedVersion ? (
            <>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-editor-border">
                <div>
                  <h4 className="font-semibold text-xs text-white">
                    Version #{selectedVersion.versionNumber}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {selectedVersion.summary || 'Code modification'}
                  </p>
                </div>

                <button
                  onClick={() => handleRollback(selectedVersion.id)}
                  disabled={rollingBack}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{rollingBack ? 'Restoring...' : 'Rollback'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-editor-surface/80 rounded-lg p-3 font-mono text-xs text-slate-200 border border-editor-border whitespace-pre">
                {selectedVersion.code}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 m-auto">Select a snapshot to preview</p>
          )}
        </div>
      </div>
    </div>
  );
};
