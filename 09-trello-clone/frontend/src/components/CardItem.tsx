'use client';

import React from 'react';
import { CheckSquare, MessageSquare, Clock, AlignLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CardItemProps {
  card: any;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, card: any) => void;
}

export default function CardItem({ card, onClick, onDragStart }: CardItemProps) {
  // Checklists summary
  const totalItems = card.checklists?.reduce(
    (acc: number, cl: any) => acc + (cl.items?.length || 0),
    0,
  ) || 0;
  const completedItems = card.checklists?.reduce(
    (acc: number, cl: any) =>
      acc + (cl.items?.filter((it: any) => it.isCompleted)?.length || 0),
    0,
  ) || 0;

  const commentsCount = card.comments?.length || 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-400 p-2.5 cursor-pointer transition select-none group space-y-2 hover:shadow-md"
    >
      {/* Cover Color Strip */}
      {card.coverColor && (
        <div
          className="h-2 rounded -mx-2.5 -mt-2.5 mb-2"
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      {/* Labels */}
      {Array.isArray(card.labels) && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.map((lbl: any, idx: number) => (
            <span
              key={idx}
              className={`text-[10px] font-semibold text-white px-2 py-0.5 rounded-full ${lbl.color || 'bg-blue-600'}`}
            >
              {lbl.text}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-xs font-medium text-gray-800 leading-snug break-words">
        {card.title}
      </h4>

      {/* Badges / Metrics Row */}
      <div className="flex items-center flex-wrap gap-2 text-[11px] text-gray-500 pt-1">
        {card.dueDate && (
          <span
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded ${
              new Date(card.dueDate) < new Date()
                ? 'bg-red-100 text-red-700 font-medium'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{formatDate(card.dueDate)}</span>
          </span>
        )}

        {card.description && (
          <span title="This card has a description" className="text-gray-400">
            <AlignLeft className="w-3.5 h-3.5" />
          </span>
        )}

        {totalItems > 0 && (
          <span
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded ${
              completedItems === totalItems
                ? 'bg-green-100 text-green-700 font-semibold'
                : 'text-gray-500'
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            <span>{completedItems}/{totalItems}</span>
          </span>
        )}

        {commentsCount > 0 && (
          <span className="flex items-center space-x-0.5 text-gray-500">
            <MessageSquare className="w-3 h-3" />
            <span>{commentsCount}</span>
          </span>
        )}
      </div>
    </div>
  );
}
