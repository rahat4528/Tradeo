'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { SnippetList } from '../components/SnippetList';
import { SnippetEditor } from '../components/SnippetEditor';
import { VersionHistoryDrawer } from '../components/VersionHistoryDrawer';
import { CreateSnippetModal } from '../components/CreateSnippetModal';
import { FolderModal } from '../components/FolderModal';
import { ImportExportModal } from '../components/ImportExportModal';
import { Loader2 } from 'lucide-react';

export default function SnippetWorkspacePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [snippets, setSnippets] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<any | null>(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<{
    type: 'all' | 'favorites' | 'folder' | 'tag' | 'uncategorized';
    id?: string;
  }>({ type: 'all' });

  const [loading, setLoading] = useState(true);

  // Modals
  const [isNewSnippetOpen, setIsNewSnippetOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Fetch metadata (folders & tags)
  const fetchMeta = async () => {
    try {
      const [foldersRes, tagsRes] = await Promise.all([
        api.folders.list(),
        api.tags.list(),
      ]);
      setFolders(foldersRes || []);
      setTags(tagsRes || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch snippets based on active filters and search
  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (filter.type === 'favorites') params.isFavorite = true;
      if (filter.type === 'uncategorized') params.folderId = 'root';
      if (filter.type === 'folder' && filter.id) params.folderId = filter.id;
      if (filter.type === 'tag' && filter.id) params.tag = filter.id;

      const res = await api.snippets.list(params);
      const data = res.data || [];
      setSnippets(data);

      // Select first snippet if current selection is null or not in data
      if (data.length > 0) {
        if (!selectedSnippet || !data.some((s: any) => s.id === selectedSnippet.id)) {
          setSelectedSnippet(data[0]);
        }
      } else {
        setSelectedSnippet(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, filter, selectedSnippet]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMeta();
      fetchSnippets();
    }
  }, [authLoading, user, router, fetchSnippets]);

  const handleToggleFavorite = async (e: React.MouseEvent, snippet: any) => {
    e.stopPropagation();
    try {
      const updated = await api.snippets.update(snippet.id, {
        isFavorite: !snippet.isFavorite,
      });
      setSnippets((prev) =>
        prev.map((s) => (s.id === snippet.id ? { ...s, isFavorite: updated.isFavorite } : s)),
      );
      if (selectedSnippet?.id === snippet.id) {
        setSelectedSnippet((prev: any) => ({ ...prev, isFavorite: updated.isFavorite }));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    if (window.confirm(`Delete folder "${name}"? Contained snippets will become uncategorized.`)) {
      try {
        await api.folders.delete(id);
        fetchMeta();
        fetchSnippets();
      } catch (err: any) {
        alert(err.message || 'Failed to delete folder');
      }
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-editor-dark text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-xs">Loading developer workspace...</p>
      </div>
    );
  }

  const favoriteCount = snippets.filter((s) => s.isFavorite).length;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-editor-dark">
      {/* Top Navbar */}
      <Navbar
        search={search}
        onSearchChange={setSearch}
        onNewSnippet={() => setIsNewSnippetOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
      />

      {/* Main 3-Pane Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentFilter={filter}
          onSelectFilter={setFilter}
          folders={folders}
          tags={tags}
          onAddFolder={() => setIsFolderModalOpen(true)}
          onDeleteFolder={handleDeleteFolder}
          totalCount={snippets.length}
          favoriteCount={favoriteCount}
        />

        {/* Middle Snippet List */}
        <SnippetList
          snippets={snippets}
          selectedId={selectedSnippet?.id || null}
          onSelect={setSelectedSnippet}
          onToggleFavorite={handleToggleFavorite}
          loading={loading}
          onNewSnippet={() => setIsNewSnippetOpen(true)}
        />

        {/* Right Monaco Editor */}
        <SnippetEditor
          snippet={selectedSnippet}
          folders={folders}
          onUpdated={(updated) => {
            setSelectedSnippet(updated);
            fetchSnippets();
            fetchMeta();
          }}
          onDeleted={() => {
            setSelectedSnippet(null);
            fetchSnippets();
            fetchMeta();
          }}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      </div>

      {/* Modals & Drawers */}
      <CreateSnippetModal
        isOpen={isNewSnippetOpen}
        folders={folders}
        onClose={() => setIsNewSnippetOpen(false)}
        onCreated={(created) => {
          setSelectedSnippet(created);
          fetchSnippets();
          fetchMeta();
        }}
      />

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreated={() => {
          fetchMeta();
        }}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportComplete={() => {
          fetchSnippets();
          fetchMeta();
        }}
      />

      <VersionHistoryDrawer
        isOpen={isHistoryOpen}
        snippetId={selectedSnippet?.id || null}
        onClose={() => setIsHistoryOpen(false)}
        onRolledBack={(updated) => {
          setSelectedSnippet(updated);
          fetchSnippets();
        }}
      />
    </div>
  );
}
