'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageCover from '@/components/PageCover';
import BlockEditor from '@/components/BlockEditor';
import SearchModal from '@/components/SearchModal';
import ExportModal from '@/components/ExportModal';
import { apiClient } from '@/lib/api';
import { Star, Download, Trash2, MoreHorizontal } from 'lucide-react';

export default function DocumentPage() {
  const params = useParams();
  const pageId = params.id as string;
  const router = useRouter();

  const [pages, setPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchPages = async () => {
    try {
      const res = await apiClient.get('/pages');
      setPages(res.data || []);
    } catch {
      // Guest mode
    }
  };

  const fetchCurrentPage = async () => {
    if (!pageId) return;
    try {
      const res = await apiClient.get(`/pages/${pageId}`);
      setCurrentPage(res.data);
    } catch {
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (pageId) {
      setIsLoading(true);
      fetchCurrentPage();
    }
  }, [pageId]);

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleFavorite = async () => {
    if (!currentPage) return;
    try {
      await apiClient.put(`/pages/${pageId}`, { isFavorite: !currentPage.isFavorite });
      setCurrentPage({ ...currentPage, isFavorite: !currentPage.isFavorite });
      fetchPages();
    } catch {
      alert('Failed to update favorite status');
    }
  };

  const handleDeletePage = async () => {
    if (!confirm(`Move "${currentPage.title}" to trash?`)) return;
    try {
      await apiClient.delete(`/pages/${pageId}`);
      fetchPages();
      router.push('/');
    } catch {
      alert('Failed to delete page');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        pages={pages}
        onRefresh={fetchPages}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Navbar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-2.5 flex items-center justify-between border-b border-gray-100 select-none">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="text-base">{currentPage?.icon || '📄'}</span>
            <span className="font-medium text-gray-800 truncate max-w-xs">{currentPage?.title || 'Untitled'}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleToggleFavorite}
              title={currentPage?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1.5 rounded hover:bg-gray-100 transition ${
                currentPage?.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              title="Export document to Markdown or HTML"
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition flex items-center space-x-1 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={handleDeletePage}
              title="Move to trash"
              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Content Canvas */}
        {isLoading ? (
          <div className="py-24 text-center text-xs text-gray-400">Loading document...</div>
        ) : !currentPage ? null : (
          <div className="flex-1">
            <PageCover
              page={currentPage}
              onUpdate={(updated) => {
                setCurrentPage(updated);
                fetchPages();
              }}
            />
            <BlockEditor
              pageId={currentPage.id}
              blocks={currentPage.blocks || []}
              onRefresh={fetchCurrentPage}
            />
          </div>
        )}
      </main>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ExportModal pageId={pageId} isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
