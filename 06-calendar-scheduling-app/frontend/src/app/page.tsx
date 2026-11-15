'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import {
  Calendar,
  Clock,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Video,
  Globe,
  Settings,
  CalendarCheck,
  CalendarDays,
} from 'lucide-react';
import { CreateEventTypeModal } from '../components/CreateEventTypeModal';

interface EventType {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  locationType: string;
  locationValue: string | null;
  bufferBefore: number;
  bufferAfter: number;
  isActive: boolean;
  _count?: {
    bookings: number;
  };
}

export default function HostDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchEventTypes = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await apiFetch('/event-types');
      setEventTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchEventTypes();
  }, [user]);

  const copyBookingLink = (slug: string, id: string) => {
    if (!user) return;
    const url = `${window.location.origin}/book/${user.username}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200 my-8 px-6">
        <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Friction-Free Meeting Scheduling</h2>
        <p className="text-slate-600 max-w-lg mx-auto mb-6 text-sm">
          Define bookable event types, enforce buffer intervals, prevent double-bookings, and share custom booking links across any timezone.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/login"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
          >
            Sign In to Console
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
          >
            Create Host Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Event Types</h1>
          <p className="text-sm text-slate-500">
            Create and share bookable templates that sync with your availability rules
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Event Type</span>
          </button>
        </div>
      </div>

      {/* Host Profile Info Card */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-sky-100 mb-1">Your Personal Booking Portal</div>
          <h3 className="text-xl font-bold">{user.name} (@{user.username})</h3>
          <div className="flex items-center space-x-4 mt-2 text-sm text-sky-100">
            <span className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span>{user.timezone}</span>
            </span>
            <span className="flex items-center space-x-1">
              <CalendarCheck className="w-4 h-4" />
              <span>{eventTypes.length} Active Templates</span>
            </span>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 text-xs font-mono">
          Public: /book/{user.username}
        </div>
      </div>

      {/* Event Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">Loading event types...</div>
        ) : eventTypes.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-slate-200 p-8 text-slate-500">
            No event types created yet. Click &quot;New Event Type&quot; above to create your first meeting template.
          </div>
        ) : (
          eventTypes.map((et) => (
            <div key={et.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{et.durationMinutes} mins</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {et.locationType.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{et.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {et.description || 'No description provided.'}
                </p>

                <div className="text-xs text-slate-500 space-y-1 py-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Buffers:</span>
                    <span className="font-medium text-slate-700">{et.bufferBefore}m before &bull; {et.bufferAfter}m after</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Bookings:</span>
                    <span className="font-medium text-slate-700">{et._count?.bookings || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => copyBookingLink(et.slug, et.id)}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                >
                  {copiedId === et.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <a
                  href={`/book/${user.username}/${et.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                  title="Preview Booking Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateEventTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEventTypes}
      />
    </div>
  );
}
