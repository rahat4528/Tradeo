'use client';

import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface TransferStockModalProps {
  isOpen: boolean;
  warehouses: Warehouse[];
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

export function TransferStockModal({
  isOpen,
  warehouses,
  products,
  onClose,
  onSuccess,
}: TransferStockModalProps) {
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [sourceWarehouseId, setSourceWarehouseId] = useState(warehouses[0]?.id || '');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(warehouses[1]?.id || warehouses[0]?.id || '');
  const [quantity, setQuantity] = useState('5');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (products.length > 0 && !productId) setProductId(products[0].id);
    if (warehouses.length > 0 && !sourceWarehouseId) setSourceWarehouseId(warehouses[0].id);
    if (warehouses.length > 1 && (!destinationWarehouseId || destinationWarehouseId === warehouses[0].id)) {
      setDestinationWarehouseId(warehouses[1].id);
    }
  }, [products, warehouses]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceWarehouseId === destinationWarehouseId) {
      setError('Source and destination warehouse must be different.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch('/movements/transfer', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          sourceWarehouseId,
          destinationWarehouseId,
          quantity: parseInt(quantity, 10),
          notes: notes || undefined,
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Inter-warehouse transfer failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg">
            <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
            <span>Inter-Warehouse Transfer</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Transfer Item</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">From Facility</label>
              <select
                value={sourceWarehouseId}
                onChange={(e) => setSourceWarehouseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">To Facility</label>
              <select
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Quantity to Relocate</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Transfer Dispatch Note</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Inter-city branch stock balance dispatch"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Transferring...' : 'Execute Relocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
