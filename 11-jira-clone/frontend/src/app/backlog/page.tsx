'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { Sidebar } from '../../components/Sidebar';
import { CreateIssueModal } from '../../components/CreateIssueModal';
import { CreateSprintModal } from '../../components/CreateSprintModal';
import { IssueDetailModal } from '../../components/IssueDetailModal';
import { IssueTypeBadge, PriorityBadge } from '../../components/IssueBadges';
import {
  Play,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export default function BacklogPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [backlogIssues, setBacklogIssues] = useState<any[]>([]);
  const [workflowStates, setWorkflowStates] = useState<any[]>([]);

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [targetSprintId, setTargetSprintId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (res.data.length > 0) {
        loadProjectData(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProjectData = async (projectId: string) => {
    try {
      const projRes = await api.get(`/projects/${projectId}`);
      setCurrentProject(projRes.data);
      setWorkflowStates(projRes.data.workflowStates || []);

      const sprintsRes = await api.get(`/projects/${projectId}/sprints`);
      setSprints(sprintsRes.data);

      const backlogRes = await api.get(`/projects/${projectId}/issues`, {
        params: { backlog: 'true' },
      });
      setBacklogIssues(backlogRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      await api.post(`/sprints/${sprintId}/start`);
      if (currentProject) loadProjectData(currentProject.id);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to start sprint');
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    if (!confirm('Complete this sprint? Unfinished issues will roll over to the backlog.')) {
      return;
    }
    try {
      await api.post(`/sprints/${sprintId}/complete`);
      if (currentProject) loadProjectData(currentProject.id);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to complete sprint');
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm('Delete this sprint? Issues will be moved to the backlog.')) return;
    try {
      await api.delete(`/sprints/${sprintId}`);
      if (currentProject) loadProjectData(currentProject.id);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleMoveIssueSprint = async (issueId: string, sprintId: string | null) => {
    try {
      await api.patch(`/issues/${issueId}`, { sprintId });
      if (currentProject) loadProjectData(currentProject.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar
        currentProject={currentProject}
        projects={projects}
        onSelectProject={(id) => loadProjectData(id)}
        onOpenCreateIssue={() => {
          setTargetSprintId(null);
          setIsCreateIssueOpen(true);
        }}
      />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {currentProject?.key || 'PROJ'}
              </span>
              <h1 className="text-base font-bold text-slate-900">Backlog & Sprint Planning</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Plan iterations, size user stories, and organize sprint releases.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCreateSprintOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition"
            >
              + Create Sprint
            </button>
            <button
              onClick={() => {
                setTargetSprintId(null);
                setIsCreateIssueOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition shadow"
            >
              + Create Issue
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Sprints List */}
          {sprints.map((sprint) => {
            const sprintPoints = sprint.issues?.reduce(
              (acc: number, i: any) => acc + (i.storyPoints || 0),
              0,
            );

            return (
              <div
                key={sprint.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Sprint Header */}
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        sprint.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : sprint.status === 'CLOSED'
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {sprint.status}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">{sprint.name}</h3>
                    <span className="text-xs text-slate-400">
                      ({sprint.issues?.length || 0} issues · {sprintPoints || 0} story points)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {sprint.status === 'FUTURE' && (
                      <button
                        onClick={() => handleStartSprint(sprint.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start Sprint</span>
                      </button>
                    )}

                    {sprint.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleCompleteSprint(sprint.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded transition"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Complete Sprint</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteSprint(sprint.id)}
                      title="Delete Sprint"
                      className="text-slate-400 hover:text-red-500 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sprint Goal Banner */}
                {sprint.goal && (
                  <div className="px-5 py-2 bg-slate-50/50 text-xs text-slate-500 border-b border-slate-100 italic">
                    Goal: {sprint.goal}
                  </div>
                )}

                {/* Sprint Issues */}
                <div className="divide-y divide-slate-100">
                  {sprint.issues?.map((issue: any) => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition select-none"
                    >
                      <div className="flex items-center space-x-3">
                        <IssueTypeBadge type={issue.type} />
                        <span className="text-xs font-semibold text-slate-500 w-16">
                          {issue.key}
                        </span>
                        <span className="text-xs font-medium text-slate-800">{issue.title}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {issue.status?.name}
                        </span>
                        {issue.storyPoints != null && (
                          <span className="text-xs font-bold text-slate-500 w-6 text-center">
                            {issue.storyPoints}
                          </span>
                        )}
                        <PriorityBadge priority={issue.priority} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveIssueSprint(issue.id, null);
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded"
                          title="Move to Backlog"
                        >
                          To Backlog
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!sprint.issues || sprint.issues.length === 0) && (
                    <div className="px-5 py-6 text-center text-xs text-slate-400">
                      No issues in this sprint. Move issues from backlog below.
                    </div>
                  )}
                </div>

                <div className="px-5 py-2 bg-slate-50/80 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setTargetSprintId(sprint.id);
                      setIsCreateIssueOpen(true);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    + Create issue in sprint
                  </button>
                </div>
              </div>
            );
          })}

          {/* Project Backlog Container */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">Backlog</h3>
                <span className="text-xs text-slate-400">
                  ({backlogIssues.length} issues ·{' '}
                  {backlogIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0)} story points)
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {backlogIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition select-none"
                >
                  <div className="flex items-center space-x-3">
                    <IssueTypeBadge type={issue.type} />
                    <span className="text-xs font-semibold text-slate-500 w-16">
                      {issue.key}
                    </span>
                    <span className="text-xs font-medium text-slate-800">{issue.title}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Quick Move to Sprint Dropdown */}
                    {sprints.length > 0 && (
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleMoveIssueSprint(issue.id, e.target.value)}
                        defaultValue=""
                        className="text-[11px] bg-slate-100 border border-slate-300 rounded px-2 py-0.5 text-slate-700 focus:outline-none"
                      >
                        <option value="" disabled>
                          Move to Sprint...
                        </option>
                        {sprints.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {issue.storyPoints != null && (
                      <span className="text-xs font-bold text-slate-500 w-6 text-center">
                        {issue.storyPoints}
                      </span>
                    )}
                    <PriorityBadge priority={issue.priority} />
                  </div>
                </div>
              ))}

              {backlogIssues.length === 0 && (
                <div className="px-5 py-8 text-center text-xs text-slate-400">
                  Your backlog is clear! Create an issue to begin planning.
                </div>
              )}
            </div>

            <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100">
              <button
                onClick={() => {
                  setTargetSprintId(null);
                  setIsCreateIssueOpen(true);
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                + Create issue in backlog
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        projectId={currentProject?.id}
        sprints={sprints}
        defaultSprintId={targetSprintId}
        onIssueCreated={() => {
          if (currentProject) loadProjectData(currentProject.id);
        }}
      />

      {/* Create Sprint Modal */}
      <CreateSprintModal
        isOpen={isCreateSprintOpen}
        onClose={() => setIsCreateSprintOpen(false)}
        projectId={currentProject?.id}
        onSprintCreated={() => {
          if (currentProject) loadProjectData(currentProject.id);
        }}
      />

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issueId={selectedIssueId}
        workflowStates={workflowStates}
        sprints={sprints}
        onClose={() => setSelectedIssueId(null)}
        onIssueUpdated={() => {
          if (currentProject) loadProjectData(currentProject.id);
        }}
      />
    </div>
  );
}
