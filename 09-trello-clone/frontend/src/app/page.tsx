'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CreateBoardModal from '@/components/CreateBoardModal';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LayoutGrid, Plus, Users, Clock } from 'lucide-react';

export default function BoardsDashboard() {
  const { user, workspace } = useAuth();
  const [boards, setBoards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchBoards = async () => {
    try {
      const res = await apiClient.get('/boards');
      setBoards(res.data || []);
    } catch {
      // Guest or local mode
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">
      <Navbar onOpenCreateBoard={() => setIsCreateModalOpen(true)} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="flex items-center space-x-2 text-gray-700 mb-6">
          <LayoutGrid className="w-5 h-5 text-gray-500" />
          <h1 className="text-lg font-bold">Your Boards</h1>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-500">Loading boards...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.map((b) => (
              <Link
                key={b.id}
                href={`/b/${b.id}`}
                style={{ backgroundColor: b.color || '#0079bf' }}
                className="h-28 rounded-lg p-3 text-white font-bold text-sm shadow hover:opacity-95 hover:shadow-md transition flex flex-col justify-between group relative overflow-hidden"
              >
                <span className="truncate">{b.title}</span>
                <div className="flex items-center justify-between text-[11px] text-white/80 font-normal">
                  <span>{b._count?.lists || 0} lists</span>
                  <div className="flex items-center -space-x-1">
                    {b.members?.slice(0, 3).map((m: any) => (
                      <div
                        key={m.id}
                        className="w-5 h-5 rounded-full bg-black/20 border border-white/60 flex items-center justify-center text-[9px] font-bold"
                      >
                        {m.user?.name?.[0]?.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}

            {/* Create Board Tile */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-28 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold text-xs transition flex flex-col items-center justify-center space-y-1.5"
            >
              <Plus className="w-5 h-5 text-gray-400" />
              <span>Create new board</span>
            </button>
          </div>
        )}
      </main>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newBoard) => {
          setBoards([newBoard, ...boards]);
        }}
      />
    </div>
  );
}
