'use client';

import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { X, AlertCircle } from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
}

interface CreateDealModalProps {
  isOpen: boolean;
  companies: Company[];
  contacts: Contact[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDealModal({ isOpen, companies, contacts, onClose, onSuccess }: CreateDealModalProps) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('50000');
  const [stage, setStage] = useState('LEAD');
  const [probability, setProbability] = useState('10');
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [contactId, setContactId] = useState(contacts[0]?.id || '');
  const [closeDate, setCloseDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (companies.length > 0 && !companyId) setCompanyId(companies[0].id);
    if (contacts.length > 0 && !contactId) setContactId(contacts[0].id);
  }, [companies, contacts]);

  if (!isOpen) return null;

  const handleStageChange = (newStage: string) => {
    setStage(newStage);
    const probMap: Record<string, string> = {
      LEAD: '10',
      QUALIFIED: '25',
      PROPOSAL: '50',
      NEGOTIATION: '75',
      CLOSED_WON: '100',
      CLOSED_LOST: '0',
    };
    if (probMap[newStage]) setProbability(probMap[newStage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch('/deals', {
        method: 'POST',
        body: JSON.stringify({
          title,
          value: parseFloat(value),
          stage,
          probability: parseInt(probability, 10),
          companyId: companyId || undefined,
          contactId: contactId || undefined,
          closeDate: closeDate || undefined,
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create deal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">New Deal Opportunity</h3>
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
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Deal Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enterprise Fleet Automation License"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Estimated Value ($) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="LEAD">Lead (10%)</option>
                <option value="QUALIFIED">Qualified (25%)</option>
                <option value="PROPOSAL">Proposal (50%)</option>
                <option value="NEGOTIATION">Negotiation (75%)</option>
                <option value="CLOSED_WON">Closed Won (100%)</option>
                <option value="CLOSED_LOST">Closed Lost (0%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Associated Company</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">None / Unassigned</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Primary Contact</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">None / Unassigned</option>
                {contacts.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.firstName} {ct.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Target Close Date</label>
            <input
              type="date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
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
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
