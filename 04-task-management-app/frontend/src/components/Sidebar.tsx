'use client';

import React from 'react';
import {
  Inbox,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Folder,
  Plus,
  Hash,
} from 'lucide-react';

interface SidebarProps {
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  categories: any[];
  onOpenCreateCategory: () => void;
}

export function Sidebar({
  activeFilter,
  onSelectFilter,
  selectedCategoryId,
  onSelectCategory,
  categories,
  onOpenCreateCategory,
}: SidebarProps) {
  const navItems = [
    { id: 'all', label: 'All Tasks', icon: Inbox },
    { id: 'today', label: 'Due Today', icon: Calendar },
    { id: 'upcoming', label: 'Upcoming 7 Days', icon: Clock },
    { id: 'overdue', label: 'Overdue', icon: AlertCircle, danger: true },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  return (
    <aside className="w-64 shrink-0 space-y-6">
      {/* Views Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
          Views
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedCategoryId === null && activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectCategory(null);
                onSelectFilter(item.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? 'text-indigo-600'
                      : item.danger
                      ? 'text-rose-500'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Projects & Categories List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Categories & Lists
          </span>
          <button
            onClick={onOpenCreateCategory}
            className="text-slate-400 hover:text-indigo-600 p-0.5"
            title="Create category"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          {categories.map((cat) => {
            const isCatActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectFilter('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isCatActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || '#6366F1' }}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                {cat._count?.tasks !== undefined && (
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full bg-slate-100">
                    {cat._count.tasks}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
