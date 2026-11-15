'use client';

import React from 'react';
import {
  Code,
  Star,
  Folder as FolderIcon,
  FolderPlus,
  Tag as TagIcon,
  Inbox,
  Trash2,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';

interface SidebarProps {
  currentFilter: {
    type: 'all' | 'favorites' | 'folder' | 'tag' | 'uncategorized';
    id?: string;
  };
  onSelectFilter: (filter: {
    type: 'all' | 'favorites' | 'folder' | 'tag' | 'uncategorized';
    id?: string;
  }) => void;
  folders: any[];
  tags: any[];
  onAddFolder: () => void;
  onDeleteFolder: (id: string, name: string) => void;
  totalCount: number;
  favoriteCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onSelectFilter,
  folders,
  tags,
  onAddFolder,
  onDeleteFolder,
  totalCount,
  favoriteCount,
}) => {
  return (
    <aside className="w-56 bg-editor-sidebar border-r border-editor-border h-full flex flex-col select-none flex-shrink-0 text-xs">
      <div className="p-3 space-y-1">
        {/* Core Views */}
        <button
          onClick={() => onSelectFilter({ type: 'all' })}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            currentFilter.type === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-300 hover:bg-editor-surface hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Code className="w-3.5 h-3.5" />
            <span>All Snippets</span>
          </div>
          <span className="text-[10px] opacity-75">{totalCount}</span>
        </button>

        <button
          onClick={() => onSelectFilter({ type: 'favorites' })}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            currentFilter.type === 'favorites'
              ? 'bg-amber-600 text-white'
              : 'text-slate-300 hover:bg-editor-surface hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Favorites</span>
          </div>
          <span className="text-[10px] opacity-75">{favoriteCount}</span>
        </button>

        <button
          onClick={() => onSelectFilter({ type: 'uncategorized' })}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            currentFilter.type === 'uncategorized'
              ? 'bg-slate-700 text-white'
              : 'text-slate-300 hover:bg-editor-surface hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Inbox className="w-3.5 h-3.5" />
            <span>Uncategorized</span>
          </div>
        </button>
      </div>

      <div className="h-px bg-editor-border mx-3 my-1" />

      {/* Folders Section */}
      <div className="px-3 py-2 flex items-center justify-between text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-[10px]">Folders</span>
        <button
          onClick={onAddFolder}
          title="Create New Folder"
          className="hover:text-white p-0.5 rounded transition-colors"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {folders.length === 0 ? (
          <p className="text-[11px] text-slate-500 px-2 py-1 italic">No folders yet</p>
        ) : (
          folders.map((folder) => {
            const isSelected = currentFilter.type === 'folder' && currentFilter.id === folder.id;
            return (
              <div
                key={folder.id}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-editor-surface text-indigo-300 font-semibold border border-indigo-700/40'
                    : 'text-slate-300 hover:bg-editor-surface/60 hover:text-white'
                }`}
                onClick={() => onSelectFilter({ type: 'folder', id: folder.id })}
              >
                <div className="flex items-center space-x-2 truncate">
                  {isSelected ? (
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  ) : (
                    <FolderIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{folder.name}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-500 group-hover:hidden">
                    {folder._count?.snippets || 0}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.id, folder.name);
                    }}
                    title="Delete folder"
                    className="hidden group-hover:inline-flex text-slate-500 hover:text-red-400 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div className="h-px bg-editor-border my-3" />

        {/* Tags Section */}
        <div className="py-1 text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Tags</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic">No tags created</p>
          ) : (
            tags.map((tag) => {
              const isSelected = currentFilter.type === 'tag' && currentFilter.id === tag.name;
              return (
                <button
                  key={tag.id}
                  onClick={() =>
                    onSelectFilter(
                      isSelected ? { type: 'all' } : { type: 'tag', id: tag.name },
                    )
                  }
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-editor-surface text-slate-300 border-editor-border hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <TagIcon className="w-2.5 h-2.5 opacity-60" />
                  <span>#{tag.name}</span>
                  <span className="opacity-60 text-[9px]">({tag.snippetCount})</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
