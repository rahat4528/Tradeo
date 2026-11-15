'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, RefreshCw, Filter } from 'lucide-react';

interface Movement {
  id: string;
  type: string;
  quantityDelta: number;
  previousQuantity: number;
  resultingQuantity: number;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  product: {
    id: string;
    sku: string;
    name: string;
  };
  warehouse: {
    id: string;
    name: string;
    code: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

export default function MovementsPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/movements?limit=50');
      setMovements(data.movements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMovements();
  }, [user]);

  const getBadge = (type: string, delta: number) => {
    if (delta > 0) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>+{delta} ({type})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        <ArrowUpRight className="w-3.5 h-3.5" />
        <span>{delta} ({type})</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Movements & Audit Ledger</h1>
          <p className="text-sm text-slate-500">Immutable ledger of every receipt, transfer, cycle count, and dispatch</p>
        </div>
        <button
          onClick={fetchMovements}
          className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Item SKU</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4 text-center">Movement Delta</th>
                <th className="py-3 px-4 text-center">Resulting Stock</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">Loading audit ledger...</td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">No stock movements recorded yet.</td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 text-xs">
                      {m.product.sku}
                      <span className="block font-sans text-xs text-slate-500">{m.product.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs font-medium">
                      {m.warehouse.name} ({m.warehouse.code})
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getBadge(m.type, m.quantityDelta)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900">
                      {m.resultingQuantity}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {m.reference || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {m.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
