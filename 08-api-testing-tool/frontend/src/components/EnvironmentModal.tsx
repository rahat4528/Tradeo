'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';
import { X, Plus, Trash2, Check } from 'lucide-react';

interface EnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  environments: any[];
  onRefresh: () => void;
}

export default function EnvironmentModal({
  isOpen,
  onClose,
  environments,
  onRefresh,
}: EnvironmentModalProps) {
  const [selectedEnvId, setSelectedEnvId] = useState<string>(environments[0]?.id || 'new');
  const [envName, setEnvName] = useState('');
  const [variables, setVariables] = useState<{ key: string; value: string; isSecret: boolean }[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeEnv = environments.find((e) => e.id === selectedEnvId);

  React.useEffect(() => {
    if (activeEnv) {
      setEnvName(activeEnv.name);
      setVariables(activeEnv.variables || []);
      setIsDefault(activeEnv.isDefault || false);
    } else {
      setEnvName('');
      setVariables([{ key: '', value: '', isSecret: false }]);
      setIsDefault(false);
    }
  }, [selectedEnvId, activeEnv]);

  if (!isOpen) return null;

  const handleAddVar = () => {
    setVariables([...variables, { key: '', value: '', isSecret: false }]);
  };

  const handleVarChange = (idx: number, field: string, val: any) => {
    const updated = [...variables];
    (updated[idx] as any)[field] = val;
    setVariables(updated);
  };

  const handleRemoveVar = (idx: number) => {
    setVariables(variables.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cleanVars = variables.filter((v) => v.key.trim().length > 0);
      if (selectedEnvId === 'new') {
        await apiClient.post('/environments', {
          name: envName,
          variables: cleanVars,
          isDefault,
        });
      } else {
        await apiClient.put(`/environments/${selectedEnvId}`, {
          name: envName,
          variables: cleanVars,
          isDefault,
        });
      }
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save environment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedEnvId === 'new' || !confirm(`Delete environment ${envName}?`)) return;
    try {
      await apiClient.delete(`/environments/${selectedEnvId}`);
      onRefresh();
      setSelectedEnvId('new');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#30363d]">
          <h2 className="text-sm font-semibold text-white">Environment & Variables Manager</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Environments list */}
          <div className="w-1/3 border-r border-[#30363d] p-3 overflow-y-auto space-y-1">
            <button
              onClick={() => setSelectedEnvId('new')}
              className={`w-full text-left px-3 py-2 text-xs rounded transition flex items-center justify-between ${
                selectedEnvId === 'new' ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-[#21262d]'
              }`}
            >
              <span>+ Add Environment</span>
            </button>
            {environments.map((env) => (
              <button
                key={env.id}
                onClick={() => setSelectedEnvId(env.id)}
                className={`w-full text-left px-3 py-2 text-xs rounded transition flex items-center justify-between truncate ${
                  selectedEnvId === env.id ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-[#21262d]'
                }`}
              >
                <span className="truncate">{env.name}</span>
                {env.isDefault && <span className="text-[10px] bg-[#21262d] px-1.5 py-0.5 rounded text-blue-300">Def</span>}
              </button>
            ))}
          </div>

          {/* Variables editor */}
          <form onSubmit={handleSave} className="flex-1 p-4 flex flex-col overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Environment Name</label>
              <input
                type="text"
                required
                value={envName}
                onChange={(e) => setEnvName(e.target.value)}
                placeholder="e.g. Staging, Production, Local"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-[#30363d] text-blue-600 focus:ring-0 bg-[#0d1117]"
              />
              <label htmlFor="isDefault" className="text-xs text-gray-300 select-none">
                Make this the default active environment
              </label>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-300">Variables (Interpolate via {`{{variable}}`})</span>
                <button
                  type="button"
                  onClick={handleAddVar}
                  className="text-xs flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {variables.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Key (e.g. baseUrl)"
                      value={item.key}
                      onChange={(e) => handleVarChange(idx, 'key', e.target.value)}
                      className="w-1/3 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type={item.isSecret ? 'password' : 'text'}
                      placeholder="Value"
                      value={item.value}
                      onChange={(e) => handleVarChange(idx, 'value', e.target.value)}
                      className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVar(idx)}
                      className="p-1 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#30363d] flex items-center justify-between">
              {selectedEnvId !== 'new' ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete Environment
                </button>
              ) : <div />}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded text-xs text-gray-300 hover:bg-[#21262d]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                  {isSubmitting ? 'Saving...' : 'Save Environment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
