'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { formatDate, isOverdue } from '../lib/utils';
import {
  X,
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Repeat,
  Trash2,
  Clock,
  Plus,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: any | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function TaskDetailModal({ task, onClose, onRefresh }: TaskDetailModalProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  if (!task) return null;

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await api.toggleSubtask(subtaskId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle subtask');
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      setIsAddingSubtask(true);
      await api.createSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add subtask');
    } finally {
      setIsAddingSubtask(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.updateTask(task.id, { status: newStatus });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(task.id);
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const priorityColors: Record<string, string> = {
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    MEDIUM: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    LOW: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                priorityColors[task.priority] || priorityColors.MEDIUM
              }`}
            >
              {task.priority}
            </span>
            {task.category && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${task.category.color}15`,
                  color: task.category.color,
                }}
              >
                {task.category.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDeleteTask}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Status selector */}
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Status</span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{task.title}</h2>
            {task.description && (
              <p className="mt-2 text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
            {task.dueDate && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium border ${
                  isOverdue(task.dueDate) && task.status !== 'COMPLETED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>
            )}

            {task.recurrence && task.recurrence !== 'NONE' && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                <Repeat className="h-3.5 w-3.5" />
                <span>Recurs {task.recurrence.toLowerCase()}</span>
              </div>
            )}

            {task.estimatedMinutes && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>{task.estimatedMinutes} mins est.</span>
              </div>
            )}
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Subtasks Checklist
              </span>
              <span className="text-xs font-semibold text-indigo-600">
                {task.progressPercent || 0}% Done ({task.completedSubtasks || 0}/{task.totalSubtasks || 0})
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${task.progressPercent || 0}%` }}
              />
            </div>

            <div className="space-y-1.5 pt-1">
              {task.subtasks && task.subtasks.length > 0 ? (
                task.subtasks.map((st: any) => (
                  <button
                    key={st.id}
                    onClick={() => handleToggleSubtask(st.id)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors"
                  >
                    {st.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        st.isCompleted
                          ? 'text-slate-400 line-through'
                          : 'text-slate-700 font-medium'
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No subtasks yet.</p>
              )}
            </div>

            {/* Add subtask bar */}
            <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isAddingSubtask}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
