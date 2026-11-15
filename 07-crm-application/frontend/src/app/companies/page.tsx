'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Building2, Plus, Globe, Phone, MapPin, Search } from 'lucide-react';
import { CreateCompanyModal } from '../../components/CreateCompanyModal';

interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  phone: string | null;
  address: string | null;
  annualRevenue: number;
  tier: string;
  _count?: {
    contacts: number;
    deals: number;
  };
}

export default function CompaniesPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/companies${search ? `?search=${search}` : ''}`);
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCompanies();
  }, [user, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies & Accounts</h1>
          <p className="text-sm text-slate-500">Target accounts, enterprise clients, and revenue categorization</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search company name or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-slate-200 p-8 text-slate-500">
            No company accounts recorded yet. Click &quot;Add Company&quot; above to register your first target account.
          </div>
        ) : (
          companies.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                  <span className="text-xs text-slate-500 font-medium">{c.industry || 'Technology'}</span>
                </div>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                  {c.tier.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                {c.domain && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-purple-700">{c.domain}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.annualRevenue > 0 && (
                  <div className="font-medium text-slate-700">
                    Annual Revenue: <strong className="font-mono">{formatCurrency(c.annualRevenue)}</strong>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-medium">
                <span>{c._count?.contacts || 0} Contacts</span>
                <span>{c._count?.deals || 0} Deals</span>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
