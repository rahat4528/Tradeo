'use client';

import React, { useEffect, useState } from 'react';
import { X, Trash2, Send, MessageSquare } from 'lucide-react';
import { api } from '../lib/api';
import { IssueTypeBadge, PriorityBadge } from './IssueBadges';

interface IssueDetailModalProps {
  issueId: string | null;
  workflowStates: any[];
  sprints: any[];
  onClose: () => void;
  onIssueUpdated: () => void;
}

export function IssueDetailModal({
  issueId,
  workflowStates,
  sprints,
  onClose,
  onIssueUpdated,
}: IssueDetailModalProps) {
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (issueId) {
      loadIssue(issueId);
    } else {
      setIssue(null);
    }
  }, [issueId]);

  const loadIssue = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/issues/${id}`);
      setIssue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (statusId: string) => {
    if (!issue) return;
    try {
      await api.patch(`/issues/${issue.id}`, { statusId });
      loadIssue(issue.id);
      onIssueUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSprintChange = async (sprintId: string) => {
    if (!issue) return;
    try {
      await api.patch(`/issues/${issue.id}`, { sprintId: sprintId || null });
      loadIssue(issue.id);
      onIssueUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!issue) return;
    try {
      await api.patch(`/issues/${issue.id}`, { priority });
      loadIssue(issue.id);
      onIssueUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStoryPointsChange = async (storyPoints: number) => {
    if (!issue) return;
    try {
      await api.patch(`/issues/${issue.id}`, { storyPoints });
      loadIssue(issue.id);
      onIssueUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!issue || !confirm(`Delete ${issue.key}?`)) return;
    try {
      await api.delete(`/issues/${issue.id}`);
      onIssueUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !newComment.trim()) return;

    setPostingComment(true);
    try {
      await api.post(`/issues/${issue.id}/comments`, { content: newComment.trim() });
      setNewComment('');
      loadIssue(issue.id);
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  if (!issueId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {issue && <IssueTypeBadge type={issue.type} />}
            <span className="text-sm font-semibold text-slate-500">{issue?.key}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              title="Delete Issue"
              className="text-slate-400 hover:text-red-500 p-1.5 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading || !issue ? (
          <div className="p-12 text-center text-slate-400">Loading issue details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-6">
            {/* Left 2 Cols: Title, Description, Comments */}
            <div className="col-span-2 space-y-6">
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-snug">{issue.title}</h1>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <div className="bg-slate-50 rounded-md p-4 text-sm text-slate-700 whitespace-pre-wrap border border-slate-200 min-h-[80px]">
                  {issue.description || 'No description provided.'}
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Comments ({issue.comments?.length || 0})
                  </h3>
                </div>

                <div className="space-y-3">
                  {issue.comments?.map((comment: any) => (
                    <div key={comment.id} className="bg-slate-50 rounded-md p-3 border border-slate-200">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-800">{comment.user?.name}</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 text-xs border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={postingComment || !newComment.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium flex items-center space-x-1 disabled:opacity-50 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Col: Metadata attributes */}
            <div className="space-y-4 border-l border-slate-100 pl-6">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Status
                </label>
                <select
                  value={issue.statusId}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-100 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {workflowStates.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Sprint
                </label>
                <select
                  value={issue.sprintId || ''}
                  onChange={(e) => handleSprintChange(e.target.value)}
                  className="w-full text-xs bg-slate-100 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Project Backlog</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Priority
                </label>
                <select
                  value={issue.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full text-xs bg-slate-100 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="HIGHEST">Highest</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                  <option value="LOWEST">Lowest</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Story Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={issue.storyPoints ?? ''}
                  onChange={(e) => handleStoryPointsChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs bg-slate-100 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div>
                  <span className="block font-semibold">Reporter</span>
                  <span>{issue.reporter?.name}</span>
                </div>
                <div>
                  <span className="block font-semibold">Assignee</span>
                  <span>{issue.assignee?.name || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
