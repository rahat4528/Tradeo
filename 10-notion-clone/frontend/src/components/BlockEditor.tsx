'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  AlertCircle,
  Minus,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface BlockEditorProps {
  pageId: string;
  blocks: any[];
  onRefresh: () => void;
}

const BLOCK_TYPES = [
  { type: 'PARAGRAPH', label: 'Text', icon: Type },
  { type: 'HEADING_1', label: 'Heading 1', icon: Heading1 },
  { type: 'HEADING_2', label: 'Heading 2', icon: Heading2 },
  { type: 'HEADING_3', label: 'Heading 3', icon: Heading3 },
  { type: 'TODO_LIST', label: 'To-do List', icon: CheckSquare },
  { type: 'BULLET_LIST', label: 'Bulleted List', icon: List },
  { type: 'NUMBERED_LIST', label: 'Numbered List', icon: ListOrdered },
  { type: 'CODE_BLOCK', label: 'Code Block', icon: Code },
  { type: 'QUOTE', label: 'Quote', icon: Quote },
  { type: 'CALLOUT', label: 'Callout', icon: AlertCircle },
  { type: 'DIVIDER', label: 'Divider', icon: Minus },
];

export default function BlockEditor({ pageId, blocks, onRefresh }: BlockEditorProps) {
  const [activeMenuBlockId, setActiveMenuBlockId] = useState<string | null>(null);

  const handleUpdateContent = async (blockId: string, content: string) => {
    try {
      await apiClient.put(`/blocks/${blockId}`, { content });
    } catch {
      // ignore
    }
  };

  const handleToggleTodo = async (block: any) => {
    const isChecked = block.properties?.checked || false;
    try {
      await apiClient.put(`/blocks/${block.id}`, {
        properties: { ...block.properties, checked: !isChecked },
      });
      onRefresh();
    } catch {
      alert('Failed to toggle checkbox');
    }
  };

  const handleChangeType = async (blockId: string, type: string) => {
    try {
      await apiClient.put(`/blocks/${blockId}`, { type });
      setActiveMenuBlockId(null);
      onRefresh();
    } catch {
      alert('Failed to change block type');
    }
  };

  const handleAddBlock = async (afterPosition: number) => {
    try {
      await apiClient.post(`/blocks/page/${pageId}`, {
        type: 'PARAGRAPH',
        content: '',
        position: afterPosition + 500.0,
      });
      onRefresh();
    } catch {
      alert('Failed to add block');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await apiClient.delete(`/blocks/${blockId}`);
      onRefresh();
    } catch {
      alert('Failed to delete block');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-8 pb-32 space-y-1">
      {blocks.map((block) => (
        <div key={block.id} className="group relative flex items-start -ml-12 pl-12 py-0.5">
          {/* Block hover handle & type selector */}
          <div className="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 select-none transition">
            <button
              onClick={() => handleAddBlock(block.position)}
              title="Add a block below"
              className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setActiveMenuBlockId(activeMenuBlockId === block.id ? null : block.id)}
                title="Change block type or options"
                className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 cursor-grab"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>

              {activeMenuBlockId === block.id && (
                <div className="absolute left-6 top-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 w-44 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">Turn into</div>
                  {BLOCK_TYPES.map((bt) => {
                    const Icon = bt.icon;
                    return (
                      <button
                        key={bt.type}
                        onClick={() => handleChangeType(block.id, bt.type)}
                        className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center space-x-2 text-gray-700 ${
                          block.type === bt.type ? 'font-bold bg-gray-50' : ''
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-gray-500" />
                        <span>{bt.label}</span>
                      </button>
                    );
                  })}
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete block</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Block Rendering based on Type */}
          <div className="flex-1 w-full">
            {block.type === 'HEADING_1' && (
              <input
                type="text"
                defaultValue={block.content}
                placeholder="Heading 1"
                onBlur={(e) => handleUpdateContent(block.id, e.target.value)}
                className="w-full text-2xl font-bold text-gray-900 border-none focus:outline-none placeholder-gray-300 bg-transparent py-1"
              />
            )}

            {block.type === 'HEADING_2' && (
              <input
                type="text"
                defaultValue={block.content}
                placeholder="Heading 2"
                onBlur={(e) => handleUpdateContent(block.id, e.target.value)}
                className="w-full text-xl font-bold text-gray-800 border-none focus:outline-none placeholder-gray-300 bg-transparent py-1"
              />
            )}

            {block.type === 'HEADING_3' && (
              <input
                type="text"
                defaultValue={block.content}
                placeholder="Heading 3"
                onBlur={(e) => handleUpdateContent(block.id, e.target.value)}
                className="w-full text-lg font-bold text-gray-800 border-none focus:outline-none placeholder-gray-300 bg-transparent py-1"
              />
            )}

            {block.type === 'PARAGRAPH' && (
              <textarea
                rows={1}
                defaultValue={block.content}
                placeholder="Type something, or press '+' on left for commands..."
                onBlur={(e) => handleUpdateContent(block.id, e.target.value)}
                className="w-full text-sm leading-relaxed text-[#37352f] border-none focus:outline-none placeholder-gray-300 bg-transparent resize-none py-0.5"
              />
            )}

            {block.type === 'TODO_LIST' && (
              <div className="flex items-center space-x-2 py-0.5">
                <input
                  type="checkbox"
                  checked={block.properties?.checked || false}
                  onChange={() => handleToggleTodo(block)}
                  className="rounded border-gray-400 text-blue-600 focus:ring-0 w-4 h-4"
                />
                <input
                  type="text"
                  defaultValue={block.content}
                  placeholder="To-do"
                  onBlur={(e) => handleUpdateContent(block.id, e.target.value)}
                  className={`w-full text-sm border-none focus:outline-none bg-transparent ${
                    block.properties?.checked ? 'line-through text-gray-400' : 'text-[#37352f]'
                  }`}
                />
              </div>
            )}

            {block.type === 'BULLET_LIST' && (
              <div className="flex items-start space-x-2 py-0.5">
                <span className="text-gray-500 font-bold select-none">•</span>
                <input
                  type="text"
                  defaultValue={block.content}
                  placeholder="List item"
                  onBlur={(e) => handleUpdateContent(block.id, e.target.value)}
                  className="w-full text-sm border-none focus:outline-none bg-transparent"
                />
              </div>
            )}

            {block.type === 'NUMBERED_LIST' && (
              <div className="flex items-start space-x-2 py-0.5">
                <span className="text-gray-500 text-xs font-mono select-none">1.</span>
                <input
                  type="text"
                  defaultValue={block.content}
                  placeholder="List item"
                  onBlur={(e) => handleUpdateContent(block.id, e.target.value)}
                  className="w-full text-sm border-none focus:outline-none bg-transparent"
                />
              </div>
            )}

            {block.type === 'QUOTE' && (
              <div className="border-l-2 border-gray-800 pl-3.5 py-0.5 my-1">
                <textarea
                  rows={2}
                  defaultValue={block.content}
                  placeholder="Empty quote"
                  onBlur={(e) => handleUpdateContent(block.id, e.target.value)}
                  className="w-full text-sm italic text-gray-700 border-none focus:outline-none bg-transparent resize-none"
                />
              </div>
            )}

            {block.type === 'CALLOUT' && (
              <div className="bg-[#f0f4f8] border border-[#d3e2f0] rounded-lg p-3 flex items-start space-x-3 my-1">
                <span className="text-lg select-none">{block.properties?.icon || '💡'}</span>
                <textarea
                  rows={2}
                  defaultValue={block.content}
                  placeholder="Callout text..."
                  onBlur={(e) => handleUpdateContent(block.id, e.target.value)}
                  className="w-full text-sm text-gray-800 border-none focus:outline-none bg-transparent resize-none"
                />
              </div>
            )}

            {block.type === 'CODE_BLOCK' && (
              <div className="bg-[#1e1e1e] text-[#d4d4d4] rounded-lg p-3 font-mono text-xs my-1 shadow-inner">
                <div className="flex justify-between text-[10px] text-gray-500 pb-1 mb-1 border-b border-gray-800 select-none">
                  <span>{block.properties?.language || 'code'}</span>
                </div>
                <textarea
                  rows={4}
                  defaultValue={block.content}
                  placeholder="// Paste or write code here..."
                  onBlur={(e) => handleUpdateContent(block.id, e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none text-[#d4d4d4] font-mono resize-none"
                />
              </div>
            )}

            {block.type === 'DIVIDER' && (
              <div className="py-2">
                <hr className="border-t border-gray-200" />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Block at Bottom */}
      <button
        onClick={() => handleAddBlock(blocks[blocks.length - 1]?.position || 1000.0)}
        className="w-full py-2 text-left text-xs text-gray-400 hover:text-gray-600 flex items-center space-x-1 transition select-none"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Click to add a block...</span>
      </button>
    </div>
  );
}
