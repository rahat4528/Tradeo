'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const res = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
          setResults(res.data || []);
        } catch {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-gray-200 flex items-center space-x-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search pages or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm border-none focus:outline-none placeholder-gray-400 text-gray-800"
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {isSearching ? (
            <div className="py-8 text-center text-xs text-gray-400">Searching workspace...</div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              {query ? 'No matching pages found.' : 'Type to search across all documents.'}
            </div>
          ) : (
            results.map((page) => (
              <div
                key={page.id}
                onClick={() => {
                  router.push(`/p/${page.id}`);
                  onClose();
                }}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition text-xs"
              >
                <span className="text-lg">{page.icon || '📄'}</span>
                <div className="flex-1 truncate">
                  <h4 className="font-semibold text-gray-800 truncate">{page.title}</h4>
                  <span className="text-[10px] text-gray-400">
                    Updated {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
