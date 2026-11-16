'use client';

import React, { useState } from 'react';
import { Users, Plus, Shield, Check, Palette } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface BoardHeaderProps {
  board: any;
  onUpdateBoard: (data: any) => void;
  onRefresh: () => void;
}

const COLOR_OPTIONS = [
  '#0079bf', // Classic blue
  '#519839', // Green
  '#d29034', // Orange
  '#b04632', // Red
  '#89609e', // Purple
  '#cd5a91', // Pink
  '#4bbf6b', // Lime
  '#00aecc', // Sky
  '#172b4d', // Navy
];

export default function BoardHeader({ board, onUpdateBoard, onRefresh }: BoardHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title === board.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await apiClient.put(`/boards/${board.id}`, { title });
      onUpdateBoard({ ...board, title });
      setIsEditingTitle(false);
    } catch {
      setTitle(board.title);
      setIsEditingTitle(false);
    }
  };

  const handleColorChange = async (color: string) => {
    try {
      await apiClient.put(`/boards/${board.id}`, { color });
      onUpdateBoard({ ...board, color });
      setShowColorPicker(false);
    } catch (err: any) {
      alert('Failed to update board color');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await apiClient.post(`/boards/${board.id}/members`, {
        email: inviteEmail,
        role: 'MEMBER',
      });
      alert(`Member added successfully`);
      setInviteEmail('');
      setShowInviteModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm px-4 py-2 flex items-center justify-between text-white border-b border-black/10 select-none">
      <div className="flex items-center space-x-3">
        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit}>
            <input
              type="text"
              autoFocus
              value={title}
              onBlur={handleTitleSubmit}
              onChange={(e) => setTitle(e.target.value)}
              className="px-2 py-0.5 rounded bg-white text-gray-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="px-2.5 py-1 rounded hover:bg-white/20 text-sm font-bold tracking-tight transition"
          >
            {board.title}
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Change background color"
            className="p-1.5 rounded hover:bg-white/20 text-white/80 hover:text-white transition flex items-center space-x-1"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="text-xs">Color</span>
          </button>

          {showColorPicker && (
            <div className="absolute left-0 mt-2 p-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 grid grid-cols-3 gap-2 w-36">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  style={{ backgroundColor: c }}
                  className="w-9 h-7 rounded hover:opacity-80 transition flex items-center justify-center text-white"
                >
                  {board.color === c && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Members Avatars */}
        <div className="flex items-center -space-x-1.5">
          {board.members?.map((m: any) => (
            <div
              key={m.id}
              title={`${m.user.name} (${m.role})`}
              className="w-7 h-7 rounded-full bg-white/30 text-white border border-white flex items-center justify-center text-[10px] font-bold"
            >
              {m.user.name?.[0]?.toUpperCase()}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-xs font-semibold transition"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 text-gray-800 shadow-2xl">
            <h3 className="text-sm font-bold mb-1">Invite Member to Board</h3>
            <p className="text-xs text-gray-500 mb-4">Enter a registered user's email to add them as collaborator.</p>
            <form onSubmit={handleInviteMember} className="space-y-3">
              <input
                type="email"
                required
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
