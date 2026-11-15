'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { Users, Plus, Mail, Phone, Building2, Search } from 'lucide-react';
import { CreateContactModal } from '../../components/CreateContactModal';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  title: string | null;
  leadSource: string | null;
  company?: { id: string; name: string } | null;
}

export default function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contactsData, companiesData] = await Promise.all([
        apiFetch(`/contacts${search ? `?search=${search}` : ''}`),
        apiFetch('/companies'),
      ]);
      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts & Stakeholders</h1>
          <p className="text-sm text-slate-500">Key enterprise decision makers, champions, and leads</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search contact name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Contact Name</th>
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Lead Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Loading contacts...</td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">No contacts found.</td>
                </tr>
              ) : (
                contacts.map((ct) => (
                  <tr key={ct.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {ct.firstName} {ct.lastName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {ct.title || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {ct.company?.name || 'Independent'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-purple-700">
                      {ct.email}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {ct.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                        {ct.leadSource || 'Inbound'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateContactModal
        isOpen={isModalOpen}
        companies={companies}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
