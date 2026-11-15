'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import { formatDateTime } from '../../../../lib/utils';
import { Calendar, Clock, Globe, User, CheckCircle2, AlertCircle, ArrowLeft, Video } from 'lucide-react';

interface EventType {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  locationType: string;
}

interface Host {
  name: string;
  username: string;
  timezone: string;
  bio: string | null;
}

interface Slot {
  time: string;
  startTimeIso: string;
  endTimeIso: string;
  available: boolean;
}

export default function PublicBookingPage() {
  const params = useParams();
  const username = params.username as string;
  const slug = params.slug as string;

  const [host, setHost] = useState<Host | null>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scheduling state
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default tomorrow
    return d.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Invitee Form
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        setLoading(true);
        const data = await apiFetch(`/public/${username}/${slug}`);
        setHost(data.host);
        setEventType(data.eventType);
      } catch (err: any) {
        setError(err.message || 'Event not found or inactive.');
      } finally {
        setLoading(false);
      }
    }
    if (username && slug) fetchEventDetails();
  }, [username, slug]);

  useEffect(() => {
    async function fetchSlots() {
      if (!username || !slug || !selectedDate) return;
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        const data = await apiFetch(`/public/${username}/${slug}/slots?date=${selectedDate}`);
        setSlots(Array.isArray(data) ? data : []);
      } catch (err) {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [username, slug, selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch(`/public/${username}/${slug}/book`, {
        method: 'POST',
        body: JSON.stringify({
          date: selectedDate,
          startTime: selectedSlot.time,
          inviteeName,
          inviteeEmail,
          notes: notes || undefined,
          inviteeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        }),
      });
      setConfirmedBooking(res.booking);
    } catch (err: any) {
      setError(err.message || 'Failed to book slot.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error || !eventType || !host) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Event Not Available</h2>
        <p className="text-sm text-slate-500">{error || 'This link may be expired or disabled.'}</p>
      </div>
    );
  }

  // Confirmation View
  if (confirmedBooking) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Meeting Confirmed!</h2>
          <p className="text-sm text-slate-500 mt-1">A calendar invitation has been registered.</p>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-left space-y-3">
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400">Meeting</div>
            <div className="font-bold text-slate-900">{eventType.title}</div>
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400">When</div>
            <div className="text-sm font-semibold text-sky-700">
              {formatDateTime(confirmedBooking.startTime, host.timezone)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400">Host</div>
            <div className="text-sm text-slate-700">{host.name} ({host.timezone})</div>
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400">Invitee</div>
            <div className="text-sm text-slate-700">{confirmedBooking.inviteeName} ({confirmedBooking.inviteeEmail})</div>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-500">
          Booking UID: <span className="font-mono">{confirmedBooking.uid}</span>
          <div className="mt-2">
            <a
              href={`/booking/${confirmedBooking.uid}`}
              className="text-sky-600 font-semibold hover:underline"
            >
              Manage / Reschedule / Cancel this Booking &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {/* Left Column: Event Details */}
        <div className="p-6 md:p-8 space-y-6 bg-slate-50/50">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Host</div>
            <h3 className="font-bold text-slate-900 text-base">{host.name}</h3>
            <p className="text-xs text-slate-500">@{host.username}</p>
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">{eventType.title}</h1>
            <div className="flex items-center space-x-2 text-slate-600 text-sm mt-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>{eventType.durationMinutes} mins</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600 text-sm mt-1">
              <Globe className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-mono">{host.timezone}</span>
            </div>
          </div>

          {eventType.description && (
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              {eventType.description}
            </p>
          )}
        </div>

        {/* Middle & Right Column: Date & Slot Picker or Booking Form */}
        <div className="md:col-span-2 p-6 md:p-8">
          {!selectedSlot ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Select a Date & Time</h3>
                <p className="text-xs text-slate-500">Choose from available open slots</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-2">Available Slots</label>
                {loadingSlots ? (
                  <div className="text-xs text-slate-400 py-4">Checking host availability...</div>
                ) : slots.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-100">
                    No available time slots on this date. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.time}
                        onClick={() => setSelectedSlot(s)}
                        className="py-2.5 px-3 border border-sky-200 hover:border-sky-500 hover:bg-sky-50 rounded-lg text-xs font-bold text-sky-700 transition-colors shadow-xs"
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedSlot(null)}
                className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to time slots</span>
              </button>

              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-sky-700 font-semibold uppercase">Selected Time</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedDate} at {selectedSlot.time} ({host.timezone})
                  </div>
                </div>
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={inviteeName}
                    onChange={(e) => setInviteeName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={inviteeEmail}
                    onChange={(e) => setInviteeEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Additional Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Please share anything that will help prepare for our meeting."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 text-sm"
                >
                  {submitting ? 'Confirming Appointment...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
