'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Folder, FolderPlus, FileCode, Plus, Download, Upload, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

interface CollectionsSidebarProps {
  collections: any[];
  onSelectRequest: (req: any) => void;
  onRefresh: () => void;
  onSaveCurrentRequest: () => void;
}

export default function CollectionsSidebar({
  collections,
  onSelectRequest,
  onRefresh,
  onSaveCurrentRequest,
}: CollectionsSidebarProps) {
  const [newColName, setNewColName] = useState('');
  const [showNewCol, setShowNewCol] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    try {
      await apiClient.post('/collections', { name: newColName });
      setNewColName('');
      setShowNewCol(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create collection');
    }
  };

  const handleDeleteCollection = async (id: string, name: string) => {
    if (!confirm(`Delete collection "${name}" and all contained requests?`)) return;
    try {
      await apiClient.delete(`/collections/${id}`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleExport = async () => {
    try {
      const res = await apiClient.get('/collections/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-collections-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export collections');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        await apiClient.post('/collections/import', json);
        alert('Collections imported successfully');
        onRefresh();
      } catch (err: any) {
        alert('Invalid import JSON file');
      }
    };
    reader.readAsText(file);
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'text-green-400';
      case 'POST': return 'text-blue-400';
      case 'PUT': return 'text-yellow-400';
      case 'DELETE': return 'text-red-400';
      case 'PATCH': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <aside className="w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col h-full select-none">
      <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Collections</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowNewCol(!showNewCol)}
            title="Create Collection"
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#21262d]"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            title="Export Collections JSON"
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#21262d]"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <label
            title="Import Collections JSON"
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#21262d] cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {showNewCol && (
        <form onSubmit={handleCreateCollection} className="p-2 border-b border-[#30363d] bg-[#0d1117]">
          <input
            type="text"
            required
            autoFocus
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            placeholder="Collection name..."
            className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 mb-1"
          />
          <div className="flex justify-end space-x-1">
            <button
              type="button"
              onClick={() => setShowNewCol(false)}
              className="px-2 py-0.5 text-[10px] text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-0.5 text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
            >
              Add
            </button>
          </div>
        </form>
      )}

      <div className="p-2 border-b border-[#30363d]">
        <button
          onClick={onSaveCurrentRequest}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded bg-[#21262d] hover:bg-[#30363d] text-xs text-blue-400 font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save Current Request</span>
        </button>
      </div>

      {/* Collection Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {collections.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">
            No collections yet. Click + to organize your API requests.
          </div>
        ) : (
          collections.map((col) => {
            const isExpanded = expandedFolders[col.id] !== false; // default expanded
            return (
              <div key={col.id} className="group">
                <div className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#21262d] text-xs text-gray-300">
                  <div
                    onClick={() => toggleFolder(col.id)}
                    className="flex items-center space-x-1.5 cursor-pointer flex-1 truncate"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <Folder className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-medium truncate">{col.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCollection(col.id, col.name)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {isExpanded && col.requests && (
                  <div className="pl-6 space-y-0.5 mt-0.5">
                    {col.requests.length === 0 ? (
                      <div className="text-[11px] text-gray-600 py-0.5 italic">Empty folder</div>
                    ) : (
                      col.requests.map((req: any) => (
                        <div
                          key={req.id}
                          onClick={() => onSelectRequest(req)}
                          className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-[#21262d] text-xs cursor-pointer group/item"
                        >
                          <span className={`text-[10px] font-bold w-9 text-left ${getMethodBadgeClass(req.method)}`}>
                            {req.method}
                          </span>
                          <span className="text-gray-300 truncate flex-1">{req.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
