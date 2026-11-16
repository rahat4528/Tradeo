'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Image, Smile, Trash2, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface PageCoverProps {
  page: any;
  onUpdate: (updated: any) => void;
}

const EMOJI_PRESETS = ['📄', '🚀', '💡', '📖', '📝', '🎯', '🔥', '💻', '⭐', '🛠️'];
const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
];

export default function PageCover({ page, onUpdate }: PageCoverProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [title, setTitle] = useState(page.title);

  React.useEffect(() => {
    setTitle(page.title);
  }, [page.title]);

  const handleTitleBlur = async () => {
    if (title === page.title) return;
    try {
      await apiClient.put(`/pages/${page.id}`, { title });
      onUpdate({ ...page, title });
    } catch {
      setTitle(page.title);
    }
  };

  const handleSelectIcon = async (icon: string) => {
    try {
      await apiClient.put(`/pages/${page.id}`, { icon });
      onUpdate({ ...page, icon });
      setShowEmojiPicker(false);
    } catch {
      alert('Failed to update icon');
    }
  };

  const handleSetCover = async (coverUrl: string | null) => {
    try {
      await apiClient.put(`/pages/${page.id}`, { coverUrl });
      onUpdate({ ...page, coverUrl });
    } catch {
      alert('Failed to update cover');
    }
  };

  return (
    <div>
      {/* Cover Image */}
      {page.coverUrl && (
        <div className="relative h-44 w-full overflow-hidden group">
          <img src={page.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 transition flex items-center space-x-1.5 bg-black/60 px-2 py-1 rounded text-white text-xs backdrop-blur-sm">
            <button
              onClick={() => handleSetCover(COVER_PRESETS[(COVER_PRESETS.indexOf(page.coverUrl) + 1) % COVER_PRESETS.length])}
              className="hover:underline"
            >
              Change cover
            </button>
            <span>•</span>
            <button onClick={() => handleSetCover(null)} className="hover:underline text-red-300">
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-8 pt-6">
        {/* Parent Breadcrumb */}
        {page.parent && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 mb-4">
            <Link href={`/p/${page.parent.id}`} className="hover:underline flex items-center space-x-1">
              <span>{page.parent.icon || '📄'}</span>
              <span>{page.parent.title}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-800 font-medium truncate">{page.title}</span>
          </div>
        )}

        {/* Action buttons (Add Cover / Add Icon) if not set */}
        <div className="flex items-center space-x-2 text-xs text-gray-400 opacity-60 hover:opacity-100 transition mb-2">
          {!page.icon && (
            <button
              onClick={() => handleSelectIcon('📄')}
              className="flex items-center space-x-1 hover:text-gray-700"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Add icon</span>
            </button>
          )}
          {!page.coverUrl && (
            <button
              onClick={() => handleSetCover(COVER_PRESETS[0])}
              className="flex items-center space-x-1 hover:text-gray-700"
            >
              <Image className="w-3.5 h-3.5" />
              <span>Add cover</span>
            </button>
          )}
        </div>

        {/* Emoji Icon Button & Picker */}
        <div className="relative mb-3">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-4xl hover:bg-gray-100 p-1 rounded transition select-none"
          >
            {page.icon || '📄'}
          </button>

          {showEmojiPicker && (
            <div className="absolute left-0 mt-2 p-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex items-center space-x-2">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSelectIcon(emoji)}
                  className="text-2xl p-1 hover:bg-gray-100 rounded transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Document Title Input */}
        <input
          type="text"
          value={title}
          placeholder="Untitled"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="text-3xl font-extrabold text-[#37352f] w-full border-none focus:outline-none placeholder-gray-300 bg-transparent mb-6"
        />
      </div>
    </div>
  );
}
