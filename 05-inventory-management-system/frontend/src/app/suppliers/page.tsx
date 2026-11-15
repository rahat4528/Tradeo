'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Truck, Plus, PackageCheck, FileText, CheckCircle2, Clock, X } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  leadTimeDays: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: string;
  totalCost: number;
  expectedDelivery: string | null;
  receivedAt: string | null;
  createdAt: string;
  supplier: {
    id: string;
    name: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
  items: {
    id: string;
    quantity: number;
    unitCost: number;
    receivedQuantity: number;
    product: {
      sku: string;
      name: string;
    };
  }[];
}

export default function SuppliersPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Supplier modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('7');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suppData, poData] = await Promise.all([
        apiFetch('/suppliers'),
        apiFetch('/suppliers/purchase-orders'),
      ]);
      setSuppliers(suppData);
      setPurchaseOrders(poData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/suppliers', {
        method: 'POST',
        body: JSON.stringify({
          name: supplierName,
          contactName: contactName || undefined,
          email: email || undefined,
          phone: phone || undefined,
          leadTimeDays: parseInt(leadTimeDays, 10),
        }),
      });
      setIsSupplierModalOpen(false);
      setSupplierName('');
      setContactName('');
      setEmail('');
      setPhone('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create supplier.');
    }
  };

  const handleReceivePO = async (poId: string) => {
    if (!confirm('Mark all items in this purchase order as received into warehouse stock?')) return;
    try {
      await apiFetch(`/suppliers/purchase-orders/${poId}/receive`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to receive purchase order.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Suppliers Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Suppliers & Vendors</h1>
            <p className="text-sm text-slate-500">Manage approved vendor list and replenishment lead times</p>
          </div>
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{s.name}</h3>
                  <div className="text-xs text-slate-500">Lead time: {s.leadTimeDays} days</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5 pt-2 border-t border-slate-100">
                <div>Contact: {s.contactName || '—'}</div>
                <div>Email: {s.email || '—'}</div>
                <div>Phone: {s.phone || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Orders Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Purchase Orders (Procurement)</h2>
          <p className="text-sm text-slate-500">Track inbound shipments and fulfill warehouse stock automatically</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">PO #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Destination WH</th>
                  <th className="py-3 px-4 text-center">Items Count</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {po.poNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {po.supplier.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {po.warehouse.name}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {po.items.length} lines ({po.items.reduce((s, i) => s + i.quantity, 0)} units)
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900">
                        {formatCurrency(po.totalCost)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {po.status === 'RECEIVED' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Received</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Inbound</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {po.status !== 'RECEIVED' && (
                          <button
                            onClick={() => handleReceivePO(po.id)}
                            className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition-colors"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Receive Goods</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Add Approved Supplier</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSupplier} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Global Components Ltd"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Key Contact Person</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="David Miller"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="orders@vendor.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (800) 555-0199"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
