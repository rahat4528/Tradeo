'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Settings,
  Plus,
  Trash2,
  Star,
  ChevronRight,
  ChevronDown,
  LogOut,
  Folder,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface SidebarProps {
  pages: any[];
  onRefresh: () => void;
  onOpenSearch: () => void;
}

export default function Sidebar({ pages, onRefresh, onOpenSearch }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, workspace, logout } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreatePage = async (parentId?: string) => {
    try {
      const res = await apiClient.post('/pages', {
        title: 'Untitled',
        parentId: parentId || null,
        icon: '📄',
      });
      onRefresh();
      router.push(`/p/${res.data.id}`);
    } catch {
      alert('Failed to create page');
    }
  };

  const renderPageItem = (page: any, depth = 0) => {
    const isActive = pathname === `/p/${page.id}`;
    const hasChildren = Array.isArray(page.children) && page.children.length > 0;
    const isExpanded = expanded[page.id] !== false;

    return (
      <div key={page.id} className="select-none">
        <div
          onClick={() => router.push(`/p/${page.id}`)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer text-xs group transition ${
            isActive
              ? 'bg-[#e9e8e4] text-[#37352f] font-semibold'
              : 'text-[#5f5e5b] hover:bg-[#eae8e4] hover:text-[#37352f]'
          }`}
        >
          <div className="flex items-center space-x-1.5 truncate flex-1">
            {hasChildren ? (
              <span onClick={(e) => toggleExpand(page.id, e)} className="p-0.5 hover:bg-gray-300 rounded">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )}
              </span>
            ) : (
              <span className="w-3.5" />
            )}
            <span className="text-sm shrink-0">{page.icon || '📄'}</span>
            <span className="truncate">{page.title || 'Untitled'}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCreatePage(page.id);
            }}
            title="Add sub-page"
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-300 rounded text-gray-500 transition"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {page.children.map((child: any) => renderPageItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-60 bg-[#f7f6f3] border-r border-[#e6e5e0] flex flex-col h-screen select-none text-xs">
      {/* Workspace Header */}
      <div className="p-3 border-b border-[#e6e5e0] flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <div className="w-5 h-5 rounded bg-gray-800 text-white flex items-center justify-center font-bold text-[10px]">
            {workspace?.name?.[0] || 'N'}
          </div>
          <span className="font-bold text-gray-800 truncate">{workspace?.name || 'Workspace'}</span>
        </div>
        {user && (
          <button onClick={logout} title="Sign Out" className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-2 space-y-0.5 border-b border-[#e6e5e0]">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded hover:bg-[#e9e8e4] text-[#5f5e5b] hover:text-[#37352f] transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search (Ctrl+K)</span>
        </button>
        <button
          onClick={() => handleCreatePage()}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded hover:bg-[#e9e8e4] text-[#5f5e5b] hover:text-[#37352f] transition"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>New Page</span>
        </button>
      </div>

      {/* Pages Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <div className="text-[11px] font-semibold text-gray-400 px-2.5 py-1 uppercase tracking-wider">
          Pages
        </div>
        {pages.length === 0 ? (
          <div className="text-gray-400 px-3 py-4 italic text-center">No pages yet. Create one!</div>
        ) : (
          pages.map((p) => renderPageItem(p, 0))
        )}
      </div>
    </aside>
  );
}
