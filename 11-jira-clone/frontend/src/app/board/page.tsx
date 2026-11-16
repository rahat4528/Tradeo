'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { Sidebar } from '../../components/Sidebar';
import { CreateIssueModal } from '../../components/CreateIssueModal';
import { IssueDetailModal } from '../../components/IssueDetailModal';
import { IssueTypeBadge, PriorityBadge } from '../../components/IssueBadges';
import { Search, Filter, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BoardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [activeSprint, setActiveSprint] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [workflowStates, setWorkflowStates] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const projId = res.data[0].id;
        loadProjectDetails(projId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    setLoading(true);
    try {
      const projRes = await api.get(`/projects/${projectId}`);
      setCurrentProject(projRes.data);
      setWorkflowStates(projRes.data.workflowStates || []);

      const sprintsRes = await api.get(`/projects/${projectId}/sprints`);
      setSprints(sprintsRes.data);

      const active = sprintsRes.data.find((s: any) => s.status === 'ACTIVE');
      setActiveSprint(active || null);

      if (active) {
        loadIssues(projectId, active.id);
      } else {
        setIssues([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadIssues = async (projectId: string, sprintId: string) => {
    try {
      const res = await api.get(`/projects/${projectId}/issues`, {
        params: { sprintId },
      });
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    e.dataTransfer.setData('text/plain', issueId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain');
    if (!issueId) return;

    // Optimistic update
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, statusId } : i)),
    );

    try {
      await api.patch(`/issues/${issueId}`, { statusId });
    } catch (err) {
      console.error(err);
      if (currentProject && activeSprint) {
        loadIssues(currentProject.id, activeSprint.id);
      }
    }
  };

  if (authLoading || (!user && !projects.length)) {
    return <div className="p-8 text-center text-slate-500">Loading board...</div>;
  }

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.key.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType ? issue.type === selectedType : true;
    return matchesSearch && matchesType;
  });

  // Calculate story points completed
  const totalPoints = issues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
  const donePoints = issues
    .filter((i) => i.status?.category === 'DONE')
    .reduce((acc, i) => acc + (i.storyPoints || 0), 0);

  // States to show on active board (filter out 'Backlog' if needed, or show all)
  const boardStates = workflowStates.filter((s) => s.name.toLowerCase() !== 'backlog');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar
        currentProject={currentProject}
        projects={projects}
        onSelectProject={(id) => loadProjectDetails(id)}
        onOpenCreateIssue={() => setIsCreateModalOpen(true)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {currentProject?.key || 'PROJ'}
              </span>
              <h1 className="text-base font-bold text-slate-900">
                {activeSprint ? activeSprint.name : 'No Active Sprint'}
              </h1>
            </div>
            {activeSprint?.goal && (
              <p className="text-xs text-slate-500 mt-0.5">{activeSprint.goal}</p>
            )}
          </div>

          {activeSprint && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Sprint Velocity</span>
                <span className="text-xs font-semibold text-slate-800">
                  {donePoints} of {totalPoints} story points completed
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Board Controls */}
        <div className="px-6 py-3 bg-white/60 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="STORY">Story</option>
              <option value="BUG">Bug</option>
              <option value="TASK">Task</option>
              <option value="EPIC">Epic</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md transition"
            >
              + Add Issue
            </button>
          </div>
        </div>

        {/* Columns Board */}
        <div className="flex-1 overflow-x-auto p-6 flex gap-4 items-start">
          {!activeSprint ? (
            <div className="w-full flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-slate-300 text-center">
              <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No active sprint is running</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Head to Backlog & Sprints to start a sprint and assign issues.
              </p>
              <a
                href="/backlog"
                className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Go to Sprint Planning</span>
              </a>
            </div>
          ) : (
            boardStates.map((state) => {
              const stateIssues = filteredIssues.filter((i) => i.statusId === state.id);
              const columnPoints = stateIssues.reduce(
                (sum, i) => sum + (i.storyPoints || 0),
                0,
              );

              return (
                <div
                  key={state.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, state.id)}
                  className="w-72 shrink-0 bg-slate-200/80 rounded-lg p-3 flex flex-col max-h-full border border-slate-300/70"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      {state.name}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-300 px-2 py-0.5 rounded-full">
                      {stateIssues.length} {columnPoints > 0 ? `· ${columnPoints} pts` : ''}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                    {stateIssues.map((issue) => (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue.id)}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className="bg-white rounded-md p-3 shadow-sm border border-slate-200/90 cursor-pointer hover:border-blue-400 hover:shadow transition group select-none"
                      >
                        <p className="text-xs font-medium text-slate-800 line-clamp-2 mb-3">
                          {issue.title}
                        </p>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <div className="flex items-center space-x-1.5">
                            <IssueTypeBadge type={issue.type} />
                            <span className="text-[11px] font-semibold text-slate-500">
                              {issue.key}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {issue.storyPoints != null && (
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {issue.storyPoints}
                              </span>
                            )}
                            <PriorityBadge priority={issue.priority} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {stateIssues.length === 0 && (
                      <div className="border border-dashed border-slate-300 rounded p-4 text-center text-xs text-slate-400">
                        Drop issues here
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={currentProject?.id}
        sprints={sprints}
        defaultSprintId={activeSprint?.id}
        onIssueCreated={() => {
          if (currentProject && activeSprint) {
            loadIssues(currentProject.id, activeSprint.id);
          }
        }}
      />

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issueId={selectedIssueId}
        workflowStates={workflowStates}
        sprints={sprints}
        onClose={() => setSelectedIssueId(null)}
        onIssueUpdated={() => {
          if (currentProject && activeSprint) {
            loadIssues(currentProject.id, activeSprint.id);
          }
        }}
      />
    </div>
  );
}
