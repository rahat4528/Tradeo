'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { api } from '../lib/api';
import { LANGUAGE_OPTIONS, formatDate } from '../lib/utils';
import {
  Copy,
  Check,
  History,
  Trash2,
  Save,
  Folder,
  Tag,
  Star,
  FileText,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
} from 'lucide-react';

// Lazy-load Monaco editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface SnippetEditorProps {
  snippet: any | null;
  folders: any[];
  onUpdated: (updated: any) => void;
  onDeleted: (id: string) => void;
  onOpenHistory: () => void;
}

export const SnippetEditor: React.FC<SnippetEditorProps> = ({
  snippet,
  folders,
  onUpdated,
  onDeleted,
  onOpenHistory,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState('');
  const [folderId, setFolderId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const [showNotes, setShowNotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title || '');
      setDescription(snippet.description || '');
      setLanguage(snippet.language || 'typescript');
      setCode(snippet.code || '');
      setFolderId(snippet.folderId || '');
      setTagsInput(snippet.tags ? snippet.tags.join(', ') : '');
      setIsFavorite(snippet.isFavorite || false);
      setIsPublic(snippet.isPublic || false);
      setHasChanges(false);
    }
  }, [snippet]);

  if (!snippet) {
    return (
      <div className="flex-1 bg-editor-dark flex flex-col items-center justify-center text-slate-500 select-none p-8">
        <p className="text-sm font-medium">Select a snippet from the list or create a new one.</p>
        <p className="text-xs text-slate-600 mt-1">Use Monaco editor with instant syntax highlighting and revision snapshots.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const updated = await api.snippets.update(snippet.id, {
        title,
        description,
        language,
        code,
        folderId: folderId || null,
        tags,
        isFavorite,
        isPublic,
      });

      onUpdated(updated);
      setHasChanges(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
      try {
        await api.snippets.delete(snippet.id);
        onDeleted(snippet.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete snippet');
      }
    }
  };

  return (
    <div className="flex-1 bg-editor-dark h-full flex flex-col overflow-hidden">
      {/* Top Controls Bar */}
      <div className="h-14 px-4 border-b border-editor-border bg-editor-surface/40 flex items-center justify-between gap-4 flex-shrink-0 select-none">
        <div className="flex-1 flex items-center space-x-3">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Snippet Title"
            className="bg-transparent font-bold text-sm text-slate-100 focus:outline-none focus:border-b focus:border-indigo-500 flex-1 min-w-[180px] max-w-md"
          />

          <button
            onClick={() => {
              setIsFavorite(!isFavorite);
              setHasChanges(true);
            }}
            title={isFavorite ? 'Starred' : 'Star snippet'}
            className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <Star
              className={`w-4 h-4 ${isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
            />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setHasChanges(true);
            }}
            className="px-2.5 py-1 text-xs font-mono bg-editor-surface border border-editor-border rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Folder Selector */}
          <select
            value={folderId}
            onChange={(e) => {
              setFolderId(e.target.value);
              setHasChanges(true);
            }}
            className="px-2.5 py-1 text-xs bg-editor-surface border border-editor-border rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">(No Folder)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-editor-surface hover:bg-editor-surface/80 border border-editor-border text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onOpenHistory}
            title="Revision History & Rollback"
            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-editor-surface hover:bg-editor-surface/80 border border-editor-border text-slate-300 text-xs rounded-lg transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">v{snippet.versionCount}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>

          <button
            onClick={handleDelete}
            title="Delete Snippet"
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Notes / Tags section */}
      <div className="border-b border-editor-border bg-editor-sidebar/50 px-4 py-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes & Documentation</span>
              {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Inline Tags Input */}
            <div className="flex items-center space-x-1.5 flex-1 max-w-sm">
              <Tag className="w-3 h-3 text-slate-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Tags separated by commas (e.g. react, hook, api)"
                value={tagsInput}
                onChange={(e) => {
                  setTagsInput(e.target.value);
                  setHasChanges(true);
                }}
                className="bg-transparent border-none text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-500">
            <span>Last modified: {formatDate(snippet.updatedAt)}</span>
          </div>
        </div>

        {showNotes && (
          <div className="mt-2 pt-2 border-t border-editor-border animate-in fade-in duration-100">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Add markdown usage guidelines, edge cases, or dependencies..."
              className="w-full bg-editor-surface border border-editor-border rounded p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        )}
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          options={{
            fontSize: 13,
            lineNumbers: 'on',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
          onChange={(val) => {
            setCode(val || '');
            setHasChanges(true);
          }}
        />
      </div>
    </div>
  );
};
