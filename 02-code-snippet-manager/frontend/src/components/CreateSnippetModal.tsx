'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { LANGUAGE_OPTIONS } from '../lib/utils';
import { X, Code, Sparkles, Folder, Tag, AlertCircle } from 'lucide-react';

interface CreateSnippetModalProps {
  isOpen: boolean;
  folders: any[];
  onClose: () => void;
  onCreated: (snippet: any) => void;
}

export const CreateSnippetModal: React.FC<CreateSnippetModalProps> = ({
  isOpen,
  folders,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState('');
  const [folderId, setFolderId] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await api.snippets.create({
        title: title.trim(),
        description: description.trim() || undefined,
        language,
        code,
        folderId: folderId || undefined,
        tags,
      });

      onCreated(created);
      onClose();
      // Reset
      setTitle('');
      setDescription('');
      setCode('');
      setTagsInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to create snippet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-editor-surface border border-editor-border rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-editor-border bg-editor-sidebar">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-white">Create New Snippet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg flex items-center space-x-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block uppercase tracking-wider text-[10px] text-slate-400 mb-1 font-semibold">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Async Concurrent Pool Worker"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-editor-dark border border-editor-border rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block uppercase tracking-wider text-[10px] text-slate-400 mb-1 font-semibold">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-editor-dark border border-editor-border rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[10px] text-slate-400 mb-1 font-semibold">
                Destination Folder
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full bg-editor-dark border border-editor-border rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">(None - Root Inbox)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-[10px] text-slate-400 mb-1 font-semibold">
              Code Content <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={8}
              placeholder="// Paste your code implementation here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-editor-dark border border-editor-border rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block uppercase tracking-wider text-[10px] text-slate-400 mb-1 font-semibold">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="react, algorithm, performance"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-editor-dark border border-editor-border rounded-lg px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[10px] text-slate-400 mb-1 font-semibold">
                Description / Usage Notes
              </label>
              <input
                type="text"
                placeholder="Brief summary or usage guide"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-editor-dark border border-editor-border rounded-lg px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-editor-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-editor-dark rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              {loading ? 'Creating...' : 'Create Snippet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
