'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import {
  Boxes,
  AlertTriangle,
  Plus,
  ArrowRightLeft,
  SlidersHorizontal,
  Download,
  Upload,
  Search,
  Warehouse as WarehouseIcon,
  DollarSign,
  TrendingUp,
  Package,
} from 'lucide-react';
import { CreateProductModal } from '../components/CreateProductModal';
import { AdjustStockModal } from '../components/AdjustStockModal';
import { TransferStockModal } from '../components/TransferStockModal';

interface StockLevel {
  id: string;
  warehouseId: string;
  quantity: number;
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  costPrice: number;
  sellingPrice: number;
  reorderPoint: number;
  targetStock: number;
  unitOfMeasure: string;
  totalQuantity: number;
  isLowStock: boolean;
  stockLevels: StockLevel[];
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  totalUnits?: number;
  totalSkus?: number;
}

interface SummaryData {
  totalSkus: number;
  totalUnitsOnHand: number;
  totalInventoryValuation: number;
  lowStockItemCount: number;
  warehouses: Warehouse[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [productsData, warehousesData, summaryData] = await Promise.all([
        apiFetch(`/products?${new URLSearchParams({
          ...(search ? { search } : {}),
          ...(selectedWarehouse ? { warehouseId: selectedWarehouse } : {}),
          ...(lowStockOnly ? { lowStockOnly: 'true' } : {}),
        })}`),
        apiFetch('/warehouses'),
        apiFetch('/reports/summary'),
      ]);

      setProducts(Array.isArray(productsData) ? productsData : productsData?.products || []);
      setWarehouses(warehousesData || []);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, search, selectedWarehouse, lowStockOnly]);

  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('inventory_token');
      const res = await fetch('http://localhost:4004/reports/export-csv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (err) {
      alert('Failed to export CSV report');
    }
  };

  const handleOpenAdjust = (product?: Product) => {
    setSelectedProductForAdjust(product || null);
    setIsAdjustModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200 my-8 px-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Boxes className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Multi-Warehouse Inventory Control</h2>
        <p className="text-slate-600 max-w-lg mx-auto mb-6 text-sm">
          Track stock levels across multiple fulfillment centers, record verified transfer movements, automate reorder alerts, and manage supplier procurement.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/login"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
          >
            Sign In to Console
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
          >
            Register Organization
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory & Stock Ledger</h1>
          <p className="text-sm text-slate-500">
            Real-time multi-facility valuation, SKU health, and audit trail
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => handleOpenAdjust()}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Adjust Stock</span>
          </button>
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New SKU</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Active SKUs</div>
              <div className="text-2xl font-bold text-slate-900">{summary.totalSkus}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Units on Hand</div>
              <div className="text-2xl font-bold text-slate-900">{summary.totalUnitsOnHand.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Valuation (WAC)</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(summary.totalInventoryValuation)}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${summary.lowStockItemCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Low Stock Alerts</div>
              <div className="text-2xl font-bold text-amber-600">{summary.lowStockItemCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search SKU, name, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>Low Stock Only</span>
          </label>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Reorder Point</th>
                <th className="py-3 px-4 text-center">On Hand</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Loading stock records...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No items found matching the selected filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 text-xs">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {product.category || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {formatCurrency(product.costPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {product.reorderPoint}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900 text-base">
                        {product.totalQuantity}
                      </span>{' '}
                      <span className="text-xs text-slate-400">{product.unitOfMeasure}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {product.totalQuantity === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      ) : product.isLowStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenAdjust(product)}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition-colors"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={fetchData}
      />
      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        warehouses={warehouses}
        products={products}
        selectedProduct={selectedProductForAdjust}
        onClose={() => setIsAdjustModalOpen(false)}
        onSuccess={fetchData}
      />
      <TransferStockModal
        isOpen={isTransferModalOpen}
        warehouses={warehouses}
        products={products}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
