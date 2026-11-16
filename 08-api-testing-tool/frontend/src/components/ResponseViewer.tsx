'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Copy, Check, Clock, HardDrive } from 'lucide-react';
import { formatTime, formatBytes } from '@/lib/utils';

interface ResponseViewerProps {
  response: any;
  error?: string | null;
}

export default function ResponseViewer({ response, error }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'assertions'>('body');
  const [copied, setCopied] = useState(false);

  if (error) {
    return (
      <div className="flex-1 bg-[#0d1117] p-6 flex flex-col items-center justify-center text-center">
        <XCircle className="w-12 h-12 text-red-400 mb-3" />
        <h3 className="text-sm font-semibold text-white mb-1">Dispatch Error</h3>
        <p className="text-xs text-red-400 max-w-md font-mono bg-[#161b22] p-3 rounded border border-red-900/50">
          {error}
        </p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 bg-[#0d1117] flex flex-col items-center justify-center text-center p-6 text-gray-500">
        <div className="w-12 h-12 rounded-full border border-dashed border-[#30363d] flex items-center justify-center mb-3">
          <Clock className="w-5 h-5 text-gray-600" />
        </div>
        <p className="text-xs font-medium text-gray-400">Ready to dispatch</p>
        <p className="text-[11px] text-gray-600 mt-1">Enter a URL and click Send to inspect response headers, body, and test assertions.</p>
      </div>
    );
  }

  const { status, statusText, timeMs, sizeBytes, headers, data, assertions } = response;

  const getStatusBadge = (s: number) => {
    if (s >= 200 && s < 300) return 'text-green-400 bg-green-950/40 border-green-800/50';
    if (s >= 300 && s < 400) return 'text-blue-400 bg-blue-950/40 border-blue-800/50';
    if (s >= 400 && s < 500) return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/50';
    return 'text-red-400 bg-red-950/40 border-red-800/50';
  };

  const handleCopyBody = () => {
    const text = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const passedCount = (assertions || []).filter((a: any) => a.passed).length;
  const totalCount = (assertions || []).length;

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Response Metrics Header */}
      <div className="p-3 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-0.5 rounded font-bold border ${getStatusBadge(status)}`}>
            {status} {statusText}
          </span>
          <span className="flex items-center space-x-1 text-gray-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTime(timeMs)}</span>
          </span>
          <span className="flex items-center space-x-1 text-gray-300">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>{formatBytes(sizeBytes)}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {totalCount > 0 && (
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              passedCount === totalCount ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
            }`}>
              Tests: {passedCount}/{totalCount} Passed
            </span>
          )}
          <button
            onClick={handleCopyBody}
            title="Copy Response Body"
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 px-3 pt-2 bg-[#161b22] border-b border-[#30363d] text-xs">
        <button
          onClick={() => setActiveTab('body')}
          className={`px-3 py-1.5 rounded-t font-medium transition ${
            activeTab === 'body' ? 'bg-[#0d1117] text-white border-t-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Response Body
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-3 py-1.5 rounded-t font-medium transition ${
            activeTab === 'headers' ? 'bg-[#0d1117] text-white border-t-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Headers ({headers ? Object.keys(headers).length : 0})
        </button>
        <button
          onClick={() => setActiveTab('assertions')}
          className={`px-3 py-1.5 rounded-t font-medium transition ${
            activeTab === 'assertions' ? 'bg-[#0d1117] text-white border-t-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Test Results ({totalCount})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {activeTab === 'body' && (
          <pre className="p-3 bg-[#161b22] border border-[#30363d] rounded text-xs font-mono text-gray-200 overflow-x-auto whitespace-pre-wrap max-h-full">
            {typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)}
          </pre>
        )}

        {activeTab === 'headers' && (
          <div className="border border-[#30363d] rounded overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead className="bg-[#161b22] text-gray-400 border-b border-[#30363d]">
                <tr>
                  <th className="text-left p-2 font-medium w-1/3">Header</th>
                  <th className="text-left p-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {headers &&
                  Object.entries(headers).map(([k, v]) => (
                    <tr key={k} className="hover:bg-[#161b22]/50">
                      <td className="p-2 text-blue-400 font-semibold">{k}</td>
                      <td className="p-2 text-gray-300 break-all">{String(v)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'assertions' && (
          <div className="space-y-2">
            {totalCount === 0 ? (
              <div className="text-gray-500 text-xs italic py-4">No assertions configured for this request.</div>
            ) : (
              assertions.map((a: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                    a.passed
                      ? 'bg-green-950/20 border-green-800/40 text-green-300'
                      : 'bg-red-950/20 border-red-800/40 text-red-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {a.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{a.message}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#161b22] text-gray-400">
                    {a.type}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
