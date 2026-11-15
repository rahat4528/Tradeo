'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { formatDateTime } from '../../../lib/utils';
import { Calendar, Clock, Globe, User, CheckCircle2, XCircle, ArrowRightLeft, AlertCircle } from 'lucide-react';

export default function InviteeBookingManagePage() {
  const params = useParams();
  const uid = params.uid as string;

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation state
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Reschedule state
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [rescheduling, setRescheduling] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/public/bookings/${uid}`);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Booking not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) fetchBooking();
  }, [uid]);

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelling(true);
    try {
      await apiFetch(`/public/bookings/${uid}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason }),
      });
      setIsCancelOpen(false);
      fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setRescheduling(true);
    try {
      await apiFetch(`/public/bookings/${uid}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ date: newDate, startTime: newTime }),
      });
      setIsRescheduleOpen(false);
      fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Failed to reschedule');
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Booking Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'This appointment link could not be located.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase font-semibold text-slate-400">Appointment Status</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            {booking.status === 'CONFIRMED' ? (
              <span className="text-emerald-600">Confirmed Booking</span>
            ) : (
              <span className="text-red-600">Meeting Cancelled</span>
            )}
          </h1>
        </div>
        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
          {booking.status}
        </span>
      </div>

      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-3 text-sm">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase">Event</span>
          <div className="font-bold text-slate-900">{booking.eventType?.title}</div>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase">When</span>
          <div className="font-semibold text-sky-700">
            {formatDateTime(booking.startTime, booking.user?.timezone)}
          </div>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase">Host</span>
          <div className="text-slate-700">{booking.user?.name} ({booking.user?.email})</div>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase">Invitee</span>
          <div className="text-slate-700">{booking.inviteeName} ({booking.inviteeEmail})</div>
        </div>
        {booking.cancellationReason && (
          <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-700">
            <strong>Cancellation Reason:</strong> {booking.cancellationReason}
          </div>
        )}
      </div>

      {booking.status === 'CONFIRMED' && (
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={() => setIsRescheduleOpen(true)}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-700 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4 text-sky-600" />
            <span>Reschedule Meeting</span>
          </button>
          <button
            onClick={() => setIsCancelOpen(true)}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-white border border-red-200 hover:bg-red-50 rounded-lg text-sm font-semibold text-red-600 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Meeting</span>
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cancel Appointment</h3>
            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please state why you are cancelling this appointment."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCancelOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Nevermind
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reschedule Appointment</h3>
            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  New Start Time
                </label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
