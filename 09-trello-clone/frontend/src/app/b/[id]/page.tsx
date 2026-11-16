'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BoardHeader from '@/components/BoardHeader';
import CardItem from '@/components/CardItem';
import CardModal from '@/components/CardModal';
import { apiClient } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Plus, X, Trash2, MoreHorizontal } from 'lucide-react';

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = params.id as string;
  const router = useRouter();

  const [board, setBoard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // New list form
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Add card form per list
  const [addingCardListId, setAddingCardListId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  const fetchBoard = async () => {
    try {
      const res = await apiClient.get(`/boards/${boardId}`);
      setBoard(res.data);
    } catch {
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchBoard();

      // Setup Socket.IO real-time collaboration
      const socket = getSocket();
      socket.emit('joinBoard', { boardId });

      socket.on('card:created', (newCard: any) => {
        setBoard((prev: any) => {
          if (!prev) return prev;
          const updatedLists = prev.lists.map((l: any) => {
            if (l.id === newCard.listId) {
              const alreadyExists = l.cards.some((c: any) => c.id === newCard.id);
              if (alreadyExists) return l;
              return { ...l, cards: [...l.cards, newCard] };
            }
            return l;
          });
          return { ...prev, lists: updatedLists };
        });
      });

      socket.on('card:moved', (payload: any) => {
        setBoard((prev: any) => {
          if (!prev) return prev;
          const { cardId, sourceListId, targetListId, newPosition, card } = payload;
          const updatedLists = prev.lists.map((l: any) => {
            if (l.id === sourceListId && sourceListId !== targetListId) {
              return { ...l, cards: l.cards.filter((c: any) => c.id !== cardId) };
            }
            if (l.id === targetListId) {
              const filtered = l.cards.filter((c: any) => c.id !== cardId);
              const inserted = [...filtered, card || { id: cardId, position: newPosition }];
              inserted.sort((a, b) => a.position - b.position);
              return { ...l, cards: inserted };
            }
            return l;
          });
          return { ...prev, lists: updatedLists };
        });
      });

      socket.on('card:updated', (updatedCard: any) => {
        setBoard((prev: any) => {
          if (!prev) return prev;
          const updatedLists = prev.lists.map((l: any) => ({
            ...l,
            cards: l.cards.map((c: any) => (c.id === updatedCard.id ? updatedCard : c)),
          }));
          return { ...prev, lists: updatedLists };
        });
      });

      socket.on('list:created', (newList: any) => {
        setBoard((prev: any) => {
          if (!prev) return prev;
          const exists = prev.lists.some((l: any) => l.id === newList.id);
          if (exists) return prev;
          return { ...prev, lists: [...prev.lists, { ...newList, cards: [] }] };
        });
      });

      return () => {
        socket.emit('leaveBoard', { boardId });
        socket.off('card:created');
        socket.off('card:moved');
        socket.off('card:updated');
        socket.off('list:created');
      };
    }
  }, [boardId]);

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, card: any) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id, sourceListId: card.listId }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnList = async (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    try {
      const { cardId, sourceListId } = JSON.parse(dataStr);
      const targetList = board.lists.find((l: any) => l.id === targetListId);
      if (!targetList) return;

      const lastCard = targetList.cards[targetList.cards.length - 1];
      const newPos = lastCard ? lastCard.position + 1000.0 : 1000.0;

      // Optimistic update
      setBoard((prev: any) => {
        let draggedCard: any = null;
        const updated = prev.lists.map((l: any) => {
          if (l.id === sourceListId) {
            draggedCard = l.cards.find((c: any) => c.id === cardId);
            return { ...l, cards: l.cards.filter((c: any) => c.id !== cardId) };
          }
          return l;
        });

        if (draggedCard) {
          draggedCard = { ...draggedCard, listId: targetListId, position: newPos };
          return {
            ...prev,
            lists: updated.map((l: any) =>
              l.id === targetListId ? { ...l, cards: [...l.cards, draggedCard] } : l,
            ),
          };
        }
        return prev;
      });

      await apiClient.post(`/cards/${cardId}/move`, {
        targetListId,
        newPosition: newPos,
      });
    } catch {
      fetchBoard();
    }
  };

  // Add List
  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      await apiClient.post(`/lists/board/${boardId}`, { title: newListTitle });
      setNewListTitle('');
      setShowAddList(false);
      fetchBoard();
    } catch {
      alert('Failed to add list');
    }
  };

  // Delete List
  const handleDeleteList = async (listId: string, title: string) => {
    if (!confirm(`Delete list "${title}" and all its cards?`)) return;
    try {
      await apiClient.delete(`/lists/${listId}`);
      fetchBoard();
    } catch {
      alert('Failed to delete list');
    }
  };

  // Add Card
  const handleAddCard = async (listId: string) => {
    if (!newCardTitle.trim()) return;
    try {
      await apiClient.post(`/cards/list/${listId}`, { title: newCardTitle });
      setNewCardTitle('');
      setAddingCardListId(null);
      fetchBoard();
    } catch {
      alert('Failed to add card');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0079bf] flex items-center justify-center text-white text-sm">
        Loading board...
      </div>
    );
  }

  if (!board) return null;

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden transition-colors"
      style={{ backgroundColor: board.color || '#0079bf' }}
    >
      <Navbar />
      <BoardHeader board={board} onUpdateBoard={setBoard} onRefresh={fetchBoard} />

      {/* Lists Horizontal Scroll Canvas */}
      <div className="flex-1 overflow-x-auto p-4 flex items-start space-x-3 select-none">
        {board.lists?.map((list: any) => (
          <div
            key={list.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnList(e, list.id)}
            className="w-72 bg-[#ebecf0] rounded-xl flex flex-col max-h-[calc(100vh-120px)] shadow-md shrink-0 border border-black/5"
          >
            {/* List Header */}
            <div className="p-3 flex items-center justify-between text-gray-800">
              <h3 className="font-bold text-xs px-1 tracking-tight">{list.title}</h3>
              <button
                onClick={() => handleDeleteList(list.id, list.title)}
                title="Delete List"
                className="p-1 rounded hover:bg-gray-300 text-gray-500 hover:text-red-600 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cards Scroll Area */}
            <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-2 min-h-[40px]">
              {list.cards?.map((card: any) => (
                <CardItem
                  key={card.id}
                  card={card}
                  onClick={() => setSelectedCardId(card.id)}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>

            {/* Add Card Footer */}
            <div className="p-2 border-t border-gray-200">
              {addingCardListId === list.id ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    autoFocus
                    placeholder="Enter a title for this card..."
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddCard(list.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                    >
                      Add Card
                    </button>
                    <button
                      onClick={() => setAddingCardListId(null)}
                      className="p-1 text-gray-500 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAddingCardListId(list.id);
                    setNewCardTitle('');
                  }}
                  className="w-full flex items-center space-x-1.5 px-2 py-1.5 rounded hover:bg-gray-300 text-xs text-gray-600 font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add a card</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add Another List Column */}
        <div className="w-72 shrink-0">
          {showAddList ? (
            <form onSubmit={handleAddList} className="bg-[#ebecf0] p-3 rounded-xl shadow space-y-2">
              <input
                type="text"
                autoFocus
                placeholder="Enter list title..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                >
                  Add List
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddList(false)}
                  className="p-1 text-gray-500 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddList(true)}
              className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add another list</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Detail Modal */}
      <CardModal
        cardId={selectedCardId}
        onClose={() => setSelectedCardId(null)}
        onRefresh={fetchBoard}
      />
    </div>
  );
}
