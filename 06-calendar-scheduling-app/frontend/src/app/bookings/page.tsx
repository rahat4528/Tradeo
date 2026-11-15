'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import { CalendarCheck, Clock, User, Mail, Ban, X, RefreshCw } from 'lucide-react';

interface Booking {
  id: string;
  uid: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteeTimezone: string;
  inviteeNotes: string | null;
  startTime: string;
  endTime: string;
  status: string;
  cancellationReason: string | null;
  eventType: {
    title: string;
    durationMinutes: number;
    locationType: string;
  };
}

export default function HostBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');

  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/bookings');
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForCancel) return;
    setCancelling(true);
    try {
      await apiFetch(`/bookings/${selectedBookingForCancel.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason }),
      });
      setSelectedBookingForCancel(null);
      setCancelReason('');
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    if (filter === 'UPCOMING') return b.status === 'CONFIRMED' && new Date(b.startTime) >= now;
    if (filter === 'PAST') return b.status === 'CONFIRMED' && new Date(b.startTime) < now;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scheduled Bookings</h1>
          <p className="text-sm text-slate-500">Manage confirmed appointments and client attendee details</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'UPCOMING' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('PAST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'PAST' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setFilter('CANCELLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'CANCELLED' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading scheduled meetings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 text-slate-500">
            No {filter.toLowerCase()} appointments found.
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{b.eventType.title}</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {b.eventType.durationMinutes} mins
                  </span>
                  {b.status === 'CANCELLED' && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 font-semibold rounded-full">
                      Cancelled
                    </span>
                  )}
                </div>

                <div className="text-xs text-sky-700 font-medium flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDateTime(b.startTime, user?.timezone)}</span>
                </div>

                <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{b.inviteeName}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{b.inviteeEmail}</span>
                  </span>
                </div>

                {b.inviteeNotes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded mt-2 max-w-lg">
                    Note: &ldquo;{b.inviteeNotes}&rdquo;
                  </p>
                )}
                {b.cancellationReason && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2 max-w-lg">
                    Cancellation Reason: &ldquo;{b.cancellationReason}&rdquo;
                  </p>
                )}
              </div>

              {b.status === 'CONFIRMED' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedBookingForCancel(b)}
                    className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    Cancel Meeting
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Cancel Modal */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Cancel Appointment</h3>
              <button onClick={() => setSelectedBookingForCancel(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCancel} className="mt-4 space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to cancel the meeting with{' '}
                <strong className="text-slate-900">{selectedBookingForCancel.inviteeName}</strong>?
              </p>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Unforeseen schedule conflict"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Keep Meeting
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
