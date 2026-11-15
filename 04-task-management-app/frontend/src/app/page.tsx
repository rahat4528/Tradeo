'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { formatDate, isOverdue } from '../lib/utils';
import {
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  TrendingUp,
  ListTodo,
  CheckSquare,
} from 'lucide-react';

export default function TasksDashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<any | null>(null);

  // Modals state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (activeFilter !== 'all') params.filter = activeFilter;
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [tasksRes, categoriesRes, summaryRes] = await Promise.all([
        api.getTasks(params),
        api.getCategories(),
        api.getSummary(),
      ]);

      setTasks(tasksRes);
      setCategories(categoriesRes);
      setSummary(summaryRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeFilter, selectedCategoryId, searchQuery]);

  const handleToggleTaskStatus = async (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs font-bold text-slate-400 animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    MEDIUM: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    LOW: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          categories={categories}
          onOpenCreateCategory={() => setIsCreateCategoryOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          {/* Productivity Stats Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Completion Rate
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">
                    {summary.completionRate}%
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                    {summary.completedTasks}/{summary.totalTasks}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Due Today
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-indigo-600">
                    {summary.dueTodayTasks}
                  </span>
                  <Calendar className="h-4 w-4 text-indigo-400" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Overdue
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-rose-600">
                    {summary.overdueTasks}
                  </span>
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  7-Day Velocity
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-800">
                    {summary.completedPastWeek}
                  </span>
                  <CheckSquare className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          )}

          {/* Task Feed Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 capitalize">
              {selectedCategoryId
                ? categories.find((c) => c.id === selectedCategoryId)?.name || 'Category'
                : activeFilter === 'all'
                ? 'All Tasks'
                : activeFilter}
            </h1>
            <span className="text-xs font-semibold text-slate-400">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {/* Task List */}
          {tasks.length > 0 ? (
            <div className="space-y-2.5">
              {tasks.map((task) => {
                const isTaskCompleted = task.status === 'COMPLETED';
                const hasOverdue = isOverdue(task.dueDate) && !isTaskCompleted;

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskForDetail(task)}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <button
                        onClick={(e) => handleToggleTaskStatus(task, e)}
                        className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors shrink-0"
                      >
                        {isTaskCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm font-semibold truncate ${
                              isTaskCompleted
                                ? 'text-slate-400 line-through'
                                : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </h3>

                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                              priorityColors[task.priority] || priorityColors.MEDIUM
                            }`}
                          >
                            {task.priority}
                          </span>

                          {task.category && (
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: `${task.category.color}15`,
                                color: task.category.color,
                              }}
                            >
                              {task.category.name}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 truncate">{task.description}</p>
                        )}

                        {/* Subtasks Progress indicator */}
                        {task.totalSubtasks > 0 && (
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${task.progressPercent}%` }}
                              />
                            </div>
                            <span>
                              {task.completedSubtasks}/{task.totalSubtasks} subtasks
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side metadata */}
                    <div className="flex items-center gap-3 shrink-0">
                      {task.dueDate && (
                        <div
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl font-medium ${
                            hasOverdue
                              ? 'bg-rose-50 text-rose-700 font-bold'
                              : 'text-slate-500 bg-slate-50'
                          }`}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <ListTodo className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No tasks in this view</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Stay organized and hit your goals by creating your first task or subtask checklist.
              </p>
              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20"
              >
                + Add Task
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        categories={categories}
        defaultCategoryId={selectedCategoryId}
        onClose={() => setIsCreateTaskOpen(false)}
        onSuccess={loadData}
      />

      <CreateCategoryModal
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        onSuccess={loadData}
      />

      {selectedTaskForDetail && (
        <TaskDetailModal
          task={selectedTaskForDetail}
          onClose={() => setSelectedTaskForDetail(null)}
          onRefresh={() => {
            loadData();
            // Refresh detailed item if still opened
            api
              .getTask(selectedTaskForDetail.id)
              .then((updated) => setSelectedTaskForDetail(updated))
              .catch(() => setSelectedTaskForDetail(null));
          }}
        />
      )}
    </div>
  );
}
