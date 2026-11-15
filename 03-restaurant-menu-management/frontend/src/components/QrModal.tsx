'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { X, Download, Copy, Check } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  slug: string;
  restaurantName: string;
  onClose: () => void;
}

export function QrModal({ isOpen, slug, restaurantName, onClose }: QrModalProps) {
  const [table, setTable] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const qrImageUrl = api.getQrCodeUrl(slug, { table: table || undefined });
  const menuUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/m/${slug}${table ? `?table=${encodeURIComponent(table)}` : ''}`
    : `/m/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Digital Menu QR Code</h2>
            <p className="text-xs text-slate-500">{restaurantName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex flex-col items-center text-center">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center">
            {/* Display QR code using the backend SVG endpoint */}
            <img
              src={qrImageUrl}
              alt={`QR code for ${restaurantName}`}
              className="w-56 h-56 object-contain"
            />
          </div>

          <div className="w-full text-left space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Optional Table / Seat Number
            </label>
            <input
              type="text"
              placeholder="e.g., Table 12, Bar Seat 4"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="w-full flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 truncate">
            <span className="truncate">{menuUrl}</span>
            <button
              onClick={handleCopyLink}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="w-full flex gap-2">
            <a
              href={qrImageUrl}
              download={`${slug}-menu-qr.svg`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Printable SVG</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
