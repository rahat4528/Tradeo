'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import SearchModal from '@/components/SearchModal';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { FileText, Plus, Search, BookOpen } from 'lucide-react';

export default function WorkspaceHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const fetchPages = async () => {
    try {
      const res = await apiClient.get('/pages');
      setPages(res.data || []);
      // If pages exist, automatically redirect to first page
      if (res.data && res.data.length > 0) {
        router.push(`/p/${res.data[0].id}`);
      }
    } catch {
      // Guest mode
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [user]);

  const handleCreateFirstPage = async () => {
    try {
      const res = await apiClient.post('/pages', {
        title: 'Getting Started',
        icon: '🚀',
      });
      router.push(`/p/${res.data.id}`);
    } catch {
      alert('Failed to create page');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        pages={pages}
        onRefresh={fetchPages}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#f7f6f3] border border-[#e6e5e0] flex items-center justify-center mb-4 text-3xl shadow-sm">
          📚
        </div>
        <h1 className="text-xl font-bold text-[#37352f] mb-2">Welcome to Notion Clone</h1>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          Create structured notes, document processes, build engineering wikis, and organize knowledge with nested blocks.
        </p>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCreateFirstPage}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Page</span>
          </button>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition"
          >
            <Search className="w-4 h-4 text-gray-500" />
            <span>Search Docs</span>
          </button>
        </div>
      </main>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
