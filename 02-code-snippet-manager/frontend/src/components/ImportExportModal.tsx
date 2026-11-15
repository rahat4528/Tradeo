'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { X, Download, Upload, Check, AlertCircle, FileJson } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importJson, setImportJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.exportImport.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tradeo-snippets-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage('Snippets exported successfully!');
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const parsed = JSON.parse(importJson);
      const res = await api.exportImport.import(parsed);
      setMessage(`Successfully imported ${res.importedCount} snippets.`);
      onImportComplete();
      setImportJson('');
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format or import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-editor-surface border border-editor-border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3 border-b border-editor-border bg-editor-sidebar">
          <div className="flex items-center space-x-2">
            <FileJson className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-white">Import & Export Workspace</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-editor-border bg-editor-sidebar/50">
          <button
            onClick={() => {
              setActiveTab('export');
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 py-2.5 text-center font-medium transition-colors ${
              activeTab === 'export'
                ? 'border-b-2 border-indigo-500 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Export Backup
          </button>
          <button
            onClick={() => {
              setActiveTab('import');
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 py-2.5 text-center font-medium transition-colors ${
              activeTab === 'import'
                ? 'border-b-2 border-indigo-500 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Import JSON
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg flex items-center space-x-2 text-emerald-300">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800 rounded-lg flex items-center space-x-2 text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-slate-400 leading-relaxed">
                Download a complete JSON export of all your snippets, code content, tags, and folder hierarchies.
              </p>
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{loading ? 'Generating Export...' : 'Download JSON Export'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block uppercase tracking-wider text-[10px] text-slate-400 mb-1 font-semibold">
                  Paste JSON Payload
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder='{ "snippets": [ { "title": "Example", "code": "..." } ] }'
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="w-full bg-editor-dark border border-editor-border rounded-lg p-2.5 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !importJson.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{loading ? 'Importing...' : 'Execute Import'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
