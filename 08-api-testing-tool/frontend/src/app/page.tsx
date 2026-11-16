'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CollectionsSidebar from '@/components/CollectionsSidebar';
import RequestWorkbench from '@/components/RequestWorkbench';
import ResponseViewer from '@/components/ResponseViewer';
import EnvironmentModal from '@/components/EnvironmentModal';
import HistoryDrawer from '@/components/HistoryDrawer';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { X } from 'lucide-react';

export default function WorkbenchPage() {
  const { user, token } = useAuth();

  // Workbench State
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://httpbin.org/get');
  const [params, setParams] = useState<{ key: string; value: string; enabled: boolean }[]>([
    { key: '', value: '', enabled: true },
  ]);
  const [headers, setHeaders] = useState<{ key: string; value: string; enabled: boolean }[]>([
    { key: 'Accept', value: 'application/json', enabled: true },
  ]);
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState('NONE');
  const [authType, setAuthType] = useState('NONE');
  const [authConfig, setAuthConfig] = useState<any>({});
  const [assertions, setAssertions] = useState<{ type: any; target: string }[]>([
    { type: 'STATUS_EQUALS', target: '200' },
  ]);

  // Response & Execution State
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  // App Data & Drawer/Modal States
  const [collections, setCollections] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<any[]>([]);
  const [activeEnvironmentId, setActiveEnvironmentId] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);

  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveReqName, setSaveReqName] = useState('');
  const [targetCollectionId, setTargetCollectionId] = useState('');

  // Fetch Collections, Environments, History
  const fetchData = async () => {
    try {
      const [colRes, envRes, histRes] = await Promise.all([
        apiClient.get('/collections').catch(() => ({ data: [] })),
        apiClient.get('/environments').catch(() => ({ data: [] })),
        apiClient.get('/history').catch(() => ({ data: [] })),
      ]);

      setCollections(colRes.data || []);
      setEnvironments(envRes.data || []);
      setHistory(histRes.data || []);

      const defEnv = (envRes.data || []).find((e: any) => e.isDefault);
      if (defEnv && !activeEnvironmentId) {
        setActiveEnvironmentId(defEnv.id);
      }
    } catch {
      // In guest or local mode
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Dispatch request handler
  const handleDispatch = async () => {
    setIsLoading(true);
    setDispatchError(null);
    setResponse(null);

    try {
      const payload = {
        method,
        url,
        params: params.filter((p) => p.key.trim().length > 0 && p.enabled),
        headers: headers.filter((h) => h.key.trim().length > 0 && h.enabled),
        body: bodyType !== 'NONE' ? body : undefined,
        bodyType,
        authType,
        authConfig,
        environmentId: activeEnvironmentId || undefined,
        assertions,
      };

      const res = await apiClient.post('/proxy/dispatch', payload);
      setResponse(res.data);
      // Refresh history list
      apiClient.get('/history').then((h) => setHistory(h.data || [])).catch(() => {});
    } catch (err: any) {
      setDispatchError(err.response?.data?.message || err.message || 'Dispatch failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Load a saved request into workbench
  const handleSelectSavedRequest = (req: any) => {
    setMethod(req.method || 'GET');
    setUrl(req.url || '');
    setParams(Array.isArray(req.params) && req.params.length > 0 ? req.params : [{ key: '', value: '', enabled: true }]);
    setHeaders(Array.isArray(req.headers) && req.headers.length > 0 ? req.headers : [{ key: '', value: '', enabled: true }]);
    setBody(req.body || '');
    setBodyType(req.bodyType || 'NONE');
    setAuthType(req.authType || 'NONE');
    setAuthConfig(req.authConfig || {});
    setAssertions(Array.isArray(req.assertions) ? req.assertions : []);
    setResponse(null);
    setDispatchError(null);
  };

  // Load past history item into workbench
  const handleSelectHistory = async (item: any) => {
    try {
      const res = await apiClient.get(`/history/${item.id}`);
      const detailed = res.data;
      setMethod(detailed.method || 'GET');
      setUrl(detailed.url || '');
      setBody(detailed.body || '');
      setIsHistoryOpen(false);
      setResponse({
        status: detailed.responseStatus,
        statusText: detailed.responseStatusText,
        timeMs: detailed.responseTimeMs,
        sizeBytes: detailed.responseSizeBytes,
        headers: detailed.responseHeaders,
        data: (() => {
          try {
            return JSON.parse(detailed.responseBody);
          } catch {
            return detailed.responseBody;
          }
        })(),
        assertions: detailed.assertionsResult || [],
      });
    } catch (err: any) {
      alert('Failed to load history record');
    }
  };

  // Save current request to collection
  const handleSaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveReqName.trim()) return;
    try {
      await apiClient.post('/collections/requests', {
        name: saveReqName,
        method,
        url,
        params,
        headers,
        body,
        bodyType,
        authType,
        authConfig,
        assertions,
        collectionId: targetCollectionId || null,
      });
      setIsSaveModalOpen(false);
      setSaveReqName('');
      fetchData();
      alert('Request saved successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save request');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0d1117] text-[#c9d1d9]">
      <Navbar
        environments={environments}
        activeEnvironmentId={activeEnvironmentId}
        onSelectEnvironment={setActiveEnvironmentId}
        onOpenEnvModal={() => setIsEnvModalOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Collections Sidebar */}
        <CollectionsSidebar
          collections={collections}
          onSelectRequest={handleSelectSavedRequest}
          onRefresh={fetchData}
          onSaveCurrentRequest={() => {
            setSaveReqName(`${method} ${url.split('/').pop() || 'Request'}`);
            if (collections.length > 0) setTargetCollectionId(collections[0].id);
            setIsSaveModalOpen(true);
          }}
        />

        {/* Central Workbench (split: top workbench, bottom response viewer) */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="h-1/2 min-h-[300px]">
            <RequestWorkbench
              method={method}
              setMethod={setMethod}
              url={url}
              setUrl={setUrl}
              params={params}
              setParams={setParams}
              headers={headers}
              setHeaders={setHeaders}
              body={body}
              setBody={setBody}
              bodyType={bodyType}
              setBodyType={setBodyType}
              authType={authType}
              setAuthType={setAuthType}
              authConfig={authConfig}
              setAuthConfig={setAuthConfig}
              assertions={assertions}
              setAssertions={setAssertions}
              onDispatch={handleDispatch}
              isLoading={isLoading}
            />
          </div>

          <div className="h-1/2 min-h-[250px] border-t border-[#30363d]">
            <ResponseViewer response={response} error={dispatchError} />
          </div>
        </main>

        {/* Execution History Drawer */}
        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelectHistory={handleSelectHistory}
          onRefresh={fetchData}
        />
      </div>

      {/* Environments Management Modal */}
      <EnvironmentModal
        isOpen={isEnvModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        environments={environments}
        onRefresh={fetchData}
      />

      {/* Save Request Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#30363d] mb-4">
              <h3 className="text-sm font-semibold text-white">Save Request</h3>
              <button onClick={() => setIsSaveModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveRequest} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Request Name</label>
                <input
                  type="text"
                  required
                  value={saveReqName}
                  onChange={(e) => setSaveReqName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Destination Collection</label>
                <select
                  value={targetCollectionId}
                  onChange={(e) => setTargetCollectionId(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">(Root / No Collection)</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs text-gray-300 hover:bg-[#21262d]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
