'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (board: any) => void;
}

const COLORS = [
  '#0079bf',
  '#519839',
  '#d29034',
  '#b04632',
  '#89609e',
  '#cd5a91',
  '#4bbf6b',
  '#00aecc',
  '#172b4d',
];

export default function CreateBoardModal({ isOpen, onClose, onSuccess }: CreateBoardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/boards', {
        title,
        description,
        color,
      });
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create board');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl text-gray-800">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
          <h3 className="text-sm font-bold">Create Board</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Color Preview */}
          <div
            className="h-20 rounded-lg flex items-center justify-center p-2 text-white font-bold text-sm shadow-inner transition-colors"
            style={{ backgroundColor: color }}
          >
            {title || 'Board Title Preview'}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Board Title</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Sprint Backlog, Product Launch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Background Color</label>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className="h-8 rounded hover:opacity-90 flex items-center justify-center text-white"
                >
                  {color === c && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded text-xs transition"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
