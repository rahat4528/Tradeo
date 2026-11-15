'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { CalendarDays, Plus, Trash2, Save, AlertCircle, Check } from 'lucide-react';

interface DaySchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface DateOverride {
  id: string;
  date: string;
  isUnavailable: boolean;
  startTime: string | null;
  endTime: string | null;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New override form
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideUnavailable, setOverrideUnavailable] = useState(true);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/availability');
      setSchedules(data.schedules || []);
      setOverrides(data.overrides || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAvailability();
  }, [user]);

  const handleToggleDay = (dayIndex: number) => {
    const existing = schedules.find((s) => s.dayOfWeek === dayIndex);
    if (existing) {
      setSchedules(schedules.filter((s) => s.dayOfWeek !== dayIndex));
    } else {
      setSchedules([...schedules, { dayOfWeek: dayIndex, startTime: '09:00', endTime: '17:00' }]);
    }
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedules(
      schedules.map((s) => (s.dayOfWeek === dayIndex ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveWeekly = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      await apiFetch('/availability/schedule', {
        method: 'PUT',
        body: JSON.stringify({ schedules }),
      });
      setSuccessMsg('Weekly working schedule updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideDate) return;
    try {
      await apiFetch('/availability/overrides', {
        method: 'POST',
        body: JSON.stringify({
          date: overrideDate,
          isUnavailable: overrideUnavailable,
        }),
      });
      setOverrideDate('');
      fetchAvailability();
    } catch (err: any) {
      alert(err.message || 'Failed to add date override');
    }
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      await apiFetch(`/availability/overrides/${id}`, { method: 'DELETE' });
      fetchAvailability();
    } catch (err: any) {
      alert(err.message || 'Failed to delete override');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Availability & Working Hours</h1>
        <p className="text-sm text-slate-500">Configure recurring weekly availability windows and date-specific exceptions</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center space-x-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900">Weekly Working Windows</h3>
            <p className="text-xs text-slate-500">Set the hours you are open for appointments each day</p>
          </div>
          <button
            onClick={handleSaveWeekly}
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Schedule'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {DAYS.map((dayName, idx) => {
            const activeSchedule = schedules.find((s) => s.dayOfWeek === idx);
            const isEnabled = !!activeSchedule;

            return (
              <div key={dayName} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-slate-50 gap-3 border border-transparent hover:border-slate-100">
                <div className="flex items-center space-x-3 w-40">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggleDay(idx)}
                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                  />
                  <span className={`text-sm font-medium ${isEnabled ? 'text-slate-900' : 'text-slate-400'}`}>
                    {dayName}
                  </span>
                </div>

                {isEnabled ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="time"
                      value={activeSchedule.startTime}
                      onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                    <span className="text-xs text-slate-400">to</span>
                    <input
                      type="time"
                      value={activeSchedule.endTime}
                      onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Unavailable / Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Overrides */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-slate-900">Date Overrides & Special Exceptions</h3>
          <p className="text-xs text-slate-500">Block specific days for holidays or vacations</p>
        </div>

        <form onSubmit={handleAddOverride} className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            required
            value={overrideDate}
            onChange={(e) => setOverrideDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <label className="flex items-center space-x-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={overrideUnavailable}
              onChange={(e) => setOverrideUnavailable(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>Block Entire Day (Unavailable)</span>
          </label>
          <button
            type="submit"
            className="flex items-center space-x-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Date Override</span>
          </button>
        </form>

        <div className="space-y-2 pt-2">
          {overrides.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No special date overrides set.</div>
          ) : (
            overrides.map((ov) => (
              <div key={ov.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                <div>
                  <span className="font-mono font-medium text-slate-900">{ov.date}</span>
                  <span className="ml-3 text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">
                    Fully Blocked
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteOverride(ov.id)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
