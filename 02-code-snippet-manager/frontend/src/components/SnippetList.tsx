'use client';

import React from 'react';
import { formatDate, getLanguageColor } from '../lib/utils';
import { Star, Folder, Tag, Plus, Code } from 'lucide-react';

interface SnippetListProps {
  snippets: any[];
  selectedId: string | null;
  onSelect: (snippet: any) => void;
  onToggleFavorite: (e: React.MouseEvent, snippet: any) => void;
  loading: boolean;
  onNewSnippet: () => void;
}

export const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  selectedId,
  onSelect,
  onToggleFavorite,
  loading,
  onNewSnippet,
}) => {
  return (
    <div className="w-72 bg-editor-surface border-r border-editor-border h-full flex flex-col flex-shrink-0 select-none">
      {/* Header bar */}
      <div className="h-10 px-3 border-b border-editor-border flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-[10px]">
          Snippets ({snippets.length})
        </span>
        <button
          onClick={onNewSnippet}
          title="Create Snippet"
          className="text-slate-400 hover:text-white p-1 rounded"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Snippet Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-editor-border/50">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <p>Loading snippets...</p>
          </div>
        ) : snippets.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-editor-border flex items-center justify-center mx-auto text-slate-500">
              <Code className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">No snippets found</p>
            <button
              onClick={onNewSnippet}
              className="text-[11px] text-indigo-400 hover:underline font-semibold"
            >
              + Create one now
            </button>
          </div>
        ) : (
          snippets.map((snippet) => {
            const isSelected = selectedId === snippet.id;
            return (
              <div
                key={snippet.id}
                onClick={() => onSelect(snippet)}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-editor-dark border-l-2 border-indigo-500 text-white shadow-inner'
                    : 'hover:bg-editor-dark/50 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="font-semibold text-xs leading-snug truncate max-w-[200px]">
                    {snippet.title}
                  </h4>
                  <button
                    onClick={(e) => onToggleFavorite(e, snippet)}
                    className="p-0.5 text-slate-500 hover:text-amber-400 transition-colors flex-shrink-0"
                    title={snippet.isFavorite ? 'Unfavorite' : 'Favorite'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        snippet.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                      }`}
                    />
                  </button>
                </div>

                {snippet.description && (
                  <p className="text-[11px] text-slate-400 truncate mb-2">
                    {snippet.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span
                    className={`px-1.5 py-0.5 rounded border font-mono uppercase text-[9px] font-semibold ${getLanguageColor(
                      snippet.language,
                    )}`}
                  >
                    {snippet.language}
                  </span>

                  {snippet.folder && (
                    <span className="flex items-center space-x-1 truncate max-w-[90px]">
                      <Folder className="w-2.5 h-2.5" />
                      <span className="truncate">{snippet.folder.name}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
