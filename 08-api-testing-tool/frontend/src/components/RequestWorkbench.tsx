'use client';

import React, { useState } from 'react';
import { Play, Plus, Trash2, ShieldCheck, Key, Settings, Send } from 'lucide-react';

interface KeyValueItem {
  key: string;
  value: string;
  enabled: boolean;
}

interface AssertionItem {
  type: 'STATUS_EQUALS' | 'RESPONSE_TIME_LT' | 'JSON_BODY_CONTAINS' | 'HEADER_EQUALS';
  target: string;
}

interface RequestWorkbenchProps {
  method: string;
  setMethod: (m: string) => void;
  url: string;
  setUrl: (u: string) => void;
  params: KeyValueItem[];
  setParams: React.Dispatch<React.SetStateAction<KeyValueItem[]>>;
  headers: KeyValueItem[];
  setHeaders: React.Dispatch<React.SetStateAction<KeyValueItem[]>>;
  body: string;
  setBody: (b: string) => void;
  bodyType: string;
  setBodyType: (t: string) => void;
  authType: string;
  setAuthType: (a: string) => void;
  authConfig: any;
  setAuthConfig: (c: any) => void;
  assertions: AssertionItem[];
  setAssertions: React.Dispatch<React.SetStateAction<AssertionItem[]>>;
  onDispatch: () => void;
  isLoading: boolean;
}

export default function RequestWorkbench({
  method,
  setMethod,
  url,
  setUrl,
  params,
  setParams,
  headers,
  setHeaders,
  body,
  setBody,
  bodyType,
  setBodyType,
  authType,
  setAuthType,
  authConfig,
  setAuthConfig,
  assertions,
  setAssertions,
  onDispatch,
  isLoading,
}: RequestWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'assertions'>('params');

  const addParam = () => setParams([...params, { key: '', value: '', enabled: true }]);
  const updateParam = (i: number, field: string, val: any) => {
    const list = [...params];
    (list[i] as any)[field] = val;
    setParams(list);
  };
  const removeParam = (i: number) => setParams(params.filter((_, idx) => idx !== i));

  const addHeader = () => setHeaders([...headers, { key: '', value: '', enabled: true }]);
  const updateHeader = (i: number, field: string, val: any) => {
    const list = [...headers];
    (list[i] as any)[field] = val;
    setHeaders(list);
  };
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i));

  const addAssertion = () => setAssertions([...assertions, { type: 'STATUS_EQUALS', target: '200' }]);
  const updateAssertion = (i: number, field: string, val: any) => {
    const list = [...assertions];
    (list[i] as any)[field] = val;
    setAssertions(list);
  };
  const removeAssertion = (i: number) => setAssertions(assertions.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-b border-[#30363d]">
      {/* Top Request Bar */}
      <div className="p-3 bg-[#161b22] border-b border-[#30363d] flex items-center space-x-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="bg-[#21262d] border border-[#30363d] text-xs font-bold text-blue-400 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>

        <div className="flex-1 relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/v1/resource or {{baseUrl}}/endpoint"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={onDispatch}
          disabled={isLoading || !url.trim()}
          className="flex items-center space-x-1.5 px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Send</span>
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center space-x-1 px-3 pt-2 bg-[#161b22] border-b border-[#30363d] text-xs">
        <button
          onClick={() => setActiveTab('params')}
          className={`px-3 py-1.5 rounded-t font-medium transition ${
            activeTab === 'params' ? 'bg-[#0d1117] text-white border-t-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Params {params.filter((p) => p.key).length > 0 && `(${params.filter((p) => p.key).length})`}
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-3 py-1.5 rounded-t font-medium transition ${
            activeTab === 'headers' ? 'bg-[#0d1117] text-white border-t-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Headers {headers.filter((h) => h.key).length > 0 && `(${headers.filter((h) => h.key).length})`}
        </button>
        <button
          onClick={() => setActiveTab('body')}
          className={`px-3 py-1.5 rounded-t font-medium transition ${
            activeTab === 'body' ? 'bg-[#0d1117] text-white border-t-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Body {bodyType !== 'NONE' && `(${bodyType})`}
        </button>
        <button
          onClick={() => setActiveTab('auth')}
          className={`px-3 py-1.5 rounded-t font-medium transition ${
            activeTab === 'auth' ? 'bg-[#0d1117] text-white border-t-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Auth {authType !== 'NONE' && `(${authType})`}
        </button>
        <button
          onClick={() => setActiveTab('assertions')}
          className={`px-3 py-1.5 rounded-t font-medium transition ${
            activeTab === 'assertions' ? 'bg-[#0d1117] text-white border-t-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Assertions {assertions.length > 0 && `(${assertions.length})`}
        </button>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* PARAMS TAB */}
        {activeTab === 'params' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
              <span>Query Parameters</span>
              <button onClick={addParam} className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Param</span>
              </button>
            </div>
            {params.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) => updateParam(idx, 'enabled', e.target.checked)}
                  className="rounded border-[#30363d] text-blue-600 bg-[#161b22]"
                />
                <input
                  type="text"
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) => updateParam(idx, 'key', e.target.value)}
                  className="w-1/3 bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) => updateParam(idx, 'value', e.target.value)}
                  className="flex-1 bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button onClick={() => removeParam(idx)} className="p-1 text-gray-500 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* HEADERS TAB */}
        {activeTab === 'headers' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
              <span>Request Headers</span>
              <button onClick={addHeader} className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Header</span>
              </button>
            </div>
            {headers.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) => updateHeader(idx, 'enabled', e.target.checked)}
                  className="rounded border-[#30363d] text-blue-600 bg-[#161b22]"
                />
                <input
                  type="text"
                  placeholder="Header (e.g. Content-Type)"
                  value={item.key}
                  onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                  className="w-1/3 bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. application/json)"
                  value={item.value}
                  onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                  className="flex-1 bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button onClick={() => removeHeader(idx)} className="p-1 text-gray-500 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* BODY TAB */}
        {activeTab === 'body' && (
          <div className="space-y-3 flex flex-col h-full">
            <div className="flex items-center space-x-4 text-xs text-gray-300">
              {['NONE', 'JSON', 'RAW', 'URL_ENCODED'].map((type) => (
                <label key={type} className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="bodyType"
                    value={type}
                    checked={bodyType === type}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="text-blue-600 focus:ring-0 bg-[#161b22] border-[#30363d]"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            {bodyType !== 'NONE' && (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={bodyType === 'JSON' ? '{\n  "key": "value"\n}' : 'Raw payload...'}
                rows={8}
                className="w-full bg-[#161b22] border border-[#30363d] rounded p-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500 resize-none flex-1"
              />
            )}
          </div>
        )}

        {/* AUTH TAB */}
        {activeTab === 'auth' && (
          <div className="space-y-4 max-w-lg">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Authentication Strategy</label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="NONE">No Authentication</option>
                <option value="BEARER">Bearer Token</option>
                <option value="BASIC">Basic Auth</option>
                <option value="API_KEY">API Key</option>
              </select>
            </div>

            {authType === 'BEARER' && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Bearer Token</label>
                <input
                  type="password"
                  placeholder="Token or {{tokenVar}}"
                  value={authConfig.token || ''}
                  onChange={(e) => setAuthConfig({ ...authConfig, token: e.target.value })}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {authType === 'BASIC' && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400">Username</label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={authConfig.username || ''}
                    onChange={(e) => setAuthConfig({ ...authConfig, username: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={authConfig.password || ''}
                    onChange={(e) => setAuthConfig({ ...authConfig, password: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {authType === 'API_KEY' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Key</label>
                    <input
                      type="text"
                      placeholder="X-API-Key"
                      value={authConfig.key || ''}
                      onChange={(e) => setAuthConfig({ ...authConfig, key: e.target.value })}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Value</label>
                    <input
                      type="password"
                      placeholder="API secret key"
                      value={authConfig.value || ''}
                      onChange={(e) => setAuthConfig({ ...authConfig, value: e.target.value })}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Inject Into</label>
                  <select
                    value={authConfig.addTo || 'HEADER'}
                    onChange={(e) => setAuthConfig({ ...authConfig, addTo: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HEADER">HTTP Headers</option>
                    <option value="QUERY">Query Parameters</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ASSERTIONS TAB */}
        {activeTab === 'assertions' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
              <span>Automated Test Assertions</span>
              <button onClick={addAssertion} className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Assertion</span>
              </button>
            </div>
            {assertions.map((rule, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <select
                  value={rule.type}
                  onChange={(e) => updateAssertion(idx, 'type', e.target.value)}
                  className="bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="STATUS_EQUALS">Status Equals</option>
                  <option value="RESPONSE_TIME_LT">Response Time &lt; (ms)</option>
                  <option value="JSON_BODY_CONTAINS">Body Contains (text)</option>
                  <option value="HEADER_EQUALS">Header Equals (name:val)</option>
                </select>
                <input
                  type="text"
                  placeholder="Target (e.g. 200, 500, json)"
                  value={rule.target}
                  onChange={(e) => updateAssertion(idx, 'target', e.target.value)}
                  className="flex-1 bg-[#161b22] border border-[#30363d] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button onClick={() => removeAssertion(idx)} className="p-1 text-gray-500 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
