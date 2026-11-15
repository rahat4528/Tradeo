'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import {
  Activity as ActivityIcon,
  PhoneCall,
  Video,
  FileText,
  Mail,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Calendar,
  X,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  user?: { name: string };
}

interface TaskItem {
  id: string;
  title: string;
  dueDate: string | null;
  isCompleted: boolean;
  priority: string;
  deal?: { id: string; title: string };
}

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick activity log modal
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [actType, setActType] = useState('CALL');
  const [actTitle, setActTitle] = useState('');
  const [actBody, setActBody] = useState('');

  // Quick task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [actData, taskData] = await Promise.all([
        apiFetch('/activities'),
        apiFetch('/activities/tasks'),
      ]);
      setActivities(Array.isArray(actData) ? actData : []);
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/activities', {
        method: 'POST',
        body: JSON.stringify({ type: actType, title: actTitle, body: actBody }),
      });
      setIsActivityModalOpen(false);
      setActTitle('');
      setActBody('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to log activity');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/activities/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle,
          dueDate: taskDueDate || undefined,
          priority: taskPriority,
        }),
      });
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDueDate('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await apiFetch(`/activities/tasks/${taskId}/complete`, { method: 'PATCH' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle task');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <PhoneCall className="w-4 h-4 text-emerald-600" />;
      case 'MEETING':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-sky-600" />;
      default:
        return <FileText className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Activities Timeline (2 Cols) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Interaction Timeline</h1>
            <p className="text-sm text-slate-500">Chronological history of calls, meetings, notes, and emails</p>
          </div>
          <button
            onClick={() => setIsActivityModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Log Activity</span>
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading activity timeline...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 text-slate-500">
              No customer activities logged yet.
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-3.5">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
                  {getActivityIcon(act.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{act.title}</h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{act.body}</p>
                  {act.user && (
                    <div className="text-[11px] text-slate-400 pt-1">Logged by {act.user.name}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Follow-up Tasks (1 Col) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tasks & Reminders</h2>
            <p className="text-xs text-slate-500">Action items to advance pipeline deals</p>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
            title="Add task"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-400">
              No tasks currently pending.
            </div>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => handleToggleTask(t.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                  t.isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
                }`}
              >
                <div className="mt-0.5">
                  {t.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className={`text-xs font-semibold ${t.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {t.title}
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    {t.dueDate && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>
                      </span>
                    )}
                    <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {t.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Log Customer Activity</h3>
              <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateActivity} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Activity Type</label>
                <select
                  value={actType}
                  onChange={(e) => setActType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="MEETING">Meeting / Demo</option>
                  <option value="NOTE">Quick Note</option>
                  <option value="EMAIL">Email Sent/Received</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Title / Topic *</label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  placeholder="e.g. Executive Demo Call"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Summary & Next Steps *</label>
                <textarea
                  required
                  value={actBody}
                  onChange={(e) => setActBody(e.target.value)}
                  rows={3}
                  placeholder="Summarize key takeaways, action items, or feedback..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Add Task Reminder</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Send MSA contract agreement"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
