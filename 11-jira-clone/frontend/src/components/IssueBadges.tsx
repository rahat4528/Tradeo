import React from 'react';
import {
  Bookmark,
  CheckSquare,
  AlertCircle,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronsUp,
} from 'lucide-react';

export function IssueTypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'EPIC':
      return (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">
          <Zap className="w-3 h-3 text-purple-600" />
          <span>EPIC</span>
        </span>
      );
    case 'BUG':
      return (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span>BUG</span>
        </span>
      );
    case 'TASK':
      return (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
          <CheckSquare className="w-3 h-3 text-blue-600" />
          <span>TASK</span>
        </span>
      );
    case 'STORY':
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
          <Bookmark className="w-3 h-3 text-emerald-600" />
          <span>STORY</span>
        </span>
      );
  }
}

export function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case 'HIGHEST':
      return (
        <span className="inline-flex items-center space-x-1 text-red-600 text-xs font-medium" title="Highest Priority">
          <ChevronsUp className="w-3.5 h-3.5" />
          <span className="text-[11px]">Highest</span>
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center space-x-1 text-orange-600 text-xs font-medium" title="High Priority">
          <ArrowUp className="w-3.5 h-3.5" />
          <span className="text-[11px]">High</span>
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center space-x-1 text-sky-600 text-xs font-medium" title="Low Priority">
          <ArrowDown className="w-3.5 h-3.5" />
          <span className="text-[11px]">Low</span>
        </span>
      );
    case 'LOWEST':
      return (
        <span className="inline-flex items-center space-x-1 text-slate-500 text-xs font-medium" title="Lowest Priority">
          <ArrowDown className="w-3.5 h-3.5" />
          <span className="text-[11px]">Lowest</span>
        </span>
      );
    case 'MEDIUM':
    default:
      return (
        <span className="inline-flex items-center space-x-1 text-amber-600 text-xs font-medium" title="Medium Priority">
          <Minus className="w-3.5 h-3.5" />
          <span className="text-[11px]">Medium</span>
        </span>
      );
  }
}
