'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { X, QrCode, Download, ExternalLink } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  link: any | null;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, link, onClose }) => {
  const [size, setSize] = useState(300);

  if (!isOpen || !link) return null;

  const svgUrl = api.qr.getUrl(link.slug, 'svg', size);
  const pngUrl = api.qr.getUrl(link.slug, 'png', size);

  const downloadQr = async (format: 'svg' | 'png') => {
    try {
      const url = api.qr.getUrl(link.slug, format, size);
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${link.slug}-qr.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error('Failed to download QR code', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">QR Code</h3>
              <p className="text-xs text-slate-500 font-mono">/{link.slug}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shadow-inner">
            <img
              src={svgUrl}
              alt={`QR Code for ${link.slug}`}
              className="w-56 h-56 object-contain"
            />
          </div>

          <div className="w-full mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Resolution</span>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="px-2 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none"
            >
              <option value={200}>200 x 200</option>
              <option value={300}>300 x 300</option>
              <option value={500}>500 x 500</option>
              <option value={1000}>1000 x 1000 (HD)</option>
            </select>
          </div>

          <div className="w-full mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600 truncate font-mono text-center">
            {link.shortUrl}
          </div>

          <div className="w-full mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => downloadQr('svg')}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SVG</span>
            </button>
            <button
              onClick={() => downloadQr('png')}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
