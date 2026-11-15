'use client';

import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { X, AlertCircle } from 'lucide-react';

interface CreateEventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventTypeModal({ isOpen, onClose, onSuccess }: CreateEventTypeModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [locationType, setLocationType] = useState('GOOGLE_MEET');
  const [locationValue, setLocationValue] = useState('');
  const [bufferBefore, setBufferBefore] = useState('5');
  const [bufferAfter, setBufferAfter] = useState('5');
  const [minNoticeHours, setMinNoticeHours] = useState('2');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch('/event-types', {
        method: 'POST',
        body: JSON.stringify({
          title,
          slug,
          description: description || undefined,
          durationMinutes: parseInt(durationMinutes, 10),
          locationType,
          locationValue: locationValue || undefined,
          bufferBefore: parseInt(bufferBefore, 10),
          bufferAfter: parseInt(bufferAfter, 10),
          minNoticeHours: parseInt(minNoticeHours, 10),
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event type.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">New Bookable Event Type</h3>
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
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. 45 Min Strategy Advisory"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="strategy-advisory"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description / Agenda</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief agenda outline or instructions for invitees"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Duration (Minutes) *</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Location Type *</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="GOOGLE_MEET">Google Meet</option>
                <option value="ZOOM">Zoom</option>
                <option value="PHONE">Phone Call</option>
                <option value="IN_PERSON">In-Person</option>
                <option value="CUSTOM">Custom URL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Location Details / Link (Optional)</label>
            <input
              type="text"
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              placeholder="e.g. https://meet.google.com/abc-xyz or Conference Room 4B"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Buffer Before</label>
              <input
                type="number"
                min="0"
                value={bufferBefore}
                onChange={(e) => setBufferBefore(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Buffer After</label>
              <input
                type="number"
                min="0"
                value={bufferAfter}
                onChange={(e) => setBufferAfter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Min Notice (hrs)</label>
              <input
                type="number"
                min="0"
                value={minNoticeHours}
                onChange={(e) => setMinNoticeHours(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
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
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Event Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
