'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import {
  X,
  AlignLeft,
  CheckSquare,
  Clock,
  Tag,
  MessageSquare,
  Trash2,
  Plus,
  Check,
} from 'lucide-react';

interface CardModalProps {
  cardId: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

const PRESET_LABELS = [
  { id: '1', text: 'Feature', color: 'bg-blue-600' },
  { id: '2', text: 'Bug', color: 'bg-red-600' },
  { id: '3', text: 'Enhancement', color: 'bg-green-600' },
  { id: '4', text: 'Documentation', color: 'bg-yellow-600' },
  { id: '5', text: 'Urgent', color: 'bg-purple-600' },
];

export default function CardModal({ cardId, onClose, onRefresh }: CardModalProps) {
  const [card, setCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [itemInputs, setItemInputs] = useState<Record<string, string>>({});

  const fetchCard = async () => {
    if (!cardId) return;
    try {
      const res = await apiClient.get(`/cards/${cardId}`);
      setCard(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description || '');
      setDueDate(res.data.dueDate ? res.data.dueDate.substring(0, 10) : '');
    } catch {
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) fetchCard();
  }, [cardId]);

  if (!cardId) return null;

  const handleUpdateDetails = async () => {
    try {
      await apiClient.put(`/cards/${cardId}`, {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onRefresh();
    } catch (err: any) {
      alert('Failed to update card');
    }
  };

  const handleToggleLabel = async (lbl: any) => {
    const existingLabels = Array.isArray(card.labels) ? card.labels : [];
    const hasLabel = existingLabels.some((l: any) => l.text === lbl.text);
    const updated = hasLabel
      ? existingLabels.filter((l: any) => l.text !== lbl.text)
      : [...existingLabels, lbl];

    try {
      await apiClient.put(`/cards/${cardId}`, { labels: updated });
      setCard({ ...card, labels: updated });
      onRefresh();
    } catch {
      alert('Failed to update labels');
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    try {
      await apiClient.post(`/cards/${cardId}/checklists`, { title: newChecklistTitle });
      setNewChecklistTitle('');
      setShowAddChecklist(false);
      fetchCard();
      onRefresh();
    } catch {
      alert('Failed to add checklist');
    }
  };

  const handleAddChecklistItem = async (checklistId: string) => {
    const itemTitle = itemInputs[checklistId];
    if (!itemTitle?.trim()) return;
    try {
      await apiClient.post(`/cards/checklists/${checklistId}/items`, { title: itemTitle });
      setItemInputs({ ...itemInputs, [checklistId]: '' });
      fetchCard();
      onRefresh();
    } catch {
      alert('Failed to add checklist item');
    }
  };

  const handleToggleItem = async (itemId: string, currentVal: boolean) => {
    try {
      await apiClient.put(`/cards/checklists/items/${itemId}`, { isCompleted: !currentVal });
      fetchCard();
      onRefresh();
    } catch {
      alert('Failed to toggle item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await apiClient.delete(`/cards/checklists/items/${itemId}`);
      fetchCard();
      onRefresh();
    } catch {
      alert('Failed to delete item');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await apiClient.post(`/cards/${cardId}/comments`, { content: newComment });
      setNewComment('');
      fetchCard();
      onRefresh();
    } catch {
      alert('Failed to add comment');
    }
  };

  const handleDeleteCard = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
      await apiClient.delete(`/cards/${cardId}`);
      onRefresh();
      onClose();
    } catch {
      alert('Failed to delete card');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#f4f5f7] rounded-xl max-w-2xl w-full p-6 text-gray-800 shadow-2xl relative my-8 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-500">Loading card details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* Title & List breadcrumb */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleUpdateDetails}
                className="text-lg font-bold text-gray-800 bg-transparent hover:bg-white/60 focus:bg-white rounded px-2 py-1 w-full border border-transparent focus:border-blue-500 focus:outline-none transition"
              />
              <p className="text-xs text-gray-500 px-2 mt-0.5">
                in list <strong className="text-gray-700">{card?.list?.title}</strong>
              </p>
            </div>

            {/* Labels Section */}
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600 mb-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span>Labels</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_LABELS.map((lbl) => {
                  const isSelected = (card.labels || []).some((l: any) => l.text === lbl.text);
                  return (
                    <button
                      key={lbl.id}
                      onClick={() => handleToggleLabel(lbl)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded text-white transition flex items-center space-x-1 ${lbl.color} ${
                        isSelected ? 'ring-2 ring-offset-1 ring-gray-600' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span>{lbl.text}</span>
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date & Details */}
            <div className="flex items-center space-x-4 bg-white p-3 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-700">Due Date:</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={handleUpdateDetails}
                  className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600 mb-2">
                <AlignLeft className="w-4 h-4 text-gray-500" />
                <span>Description</span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleUpdateDetails}
                placeholder="Add a more detailed description..."
                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Checklists */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600">
                  <CheckSquare className="w-4 h-4 text-gray-500" />
                  <span>Checklists</span>
                </div>
                <button
                  onClick={() => setShowAddChecklist(!showAddChecklist)}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Checklist</span>
                </button>
              </div>

              {showAddChecklist && (
                <form onSubmit={handleAddChecklist} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Checklist title..."
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddChecklist(false)}
                      className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}

              {card?.checklists?.map((cl: any) => {
                const total = cl.items?.length || 0;
                const completed = cl.items?.filter((i: any) => i.isCompleted)?.length || 0;
                const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

                return (
                  <div key={cl.id} className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-gray-800">{cl.title}</h5>
                      <span className="text-[11px] font-semibold text-gray-500">{pct}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-green-500 h-1.5 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5">
                      {cl.items?.map((it: any) => (
                        <div key={it.id} className="flex items-center justify-between group py-0.5">
                          <label className="flex items-center space-x-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={it.isCompleted}
                              onChange={() => handleToggleItem(it.id, it.isCompleted)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-0"
                            />
                            <span className={`text-xs ${it.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {it.title}
                            </span>
                          </label>
                          <button
                            onClick={() => handleDeleteItem(it.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Item Row */}
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add an item..."
                        value={itemInputs[cl.id] || ''}
                        onChange={(e) => setItemInputs({ ...itemInputs, [cl.id]: e.target.value })}
                        className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleAddChecklistItem(cl.id)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comments & Activity Feed */}
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span>Comments & Activity</span>
              </div>

              <form onSubmit={handleAddComment} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Post
                </button>
              </form>

              <div className="space-y-2 pt-2">
                {card?.comments?.map((c: any) => (
                  <div key={c.id} className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-[11px]">
                      <span className="font-semibold text-gray-800">{c.author?.name}</span>
                      <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-700">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delete Card Button */}
            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleDeleteCard}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Card</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
