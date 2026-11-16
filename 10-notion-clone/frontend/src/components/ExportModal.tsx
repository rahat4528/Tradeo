'use client';

import React, { useState } from 'react';
import { Download, FileText, Code2, X, Check } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ExportModalProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ pageId, isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'markdown' | 'html'>('markdown');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await apiClient.get(`/pages/${pageId}/export?format=${format}`);
      const blob = new Blob([res.data.content], {
        type: format === 'markdown' ? 'text/markdown;charset=utf-8' : 'text/html;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch {
      alert('Failed to export document');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 text-gray-800">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
          <h3 className="text-sm font-bold">Export Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <label
            onClick={() => setFormat('markdown')}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
              format === 'markdown' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs font-semibold">Markdown (.md)</p>
                <p className="text-[11px] text-gray-500">Standard GitHub-flavored markdown</p>
              </div>
            </div>
            {format === 'markdown' && <Check className="w-4 h-4 text-blue-600" />}
          </label>

          <label
            onClick={() => setFormat('html')}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
              format === 'html' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Code2 className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs font-semibold">HTML (.html)</p>
                <p className="text-[11px] text-gray-500">Standalone document with styles</p>
              </div>
            </div>
            {format === 'html' && <Check className="w-4 h-4 text-purple-600" />}
          </label>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded text-xs transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Download File'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
