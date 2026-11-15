const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('tradeo_snippets_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  auth: {
    register: (payload: { email: string; password: string; name?: string }) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    login: (payload: { email: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    me: () => request('/auth/me'),
  },

  snippets: {
    create: (payload: any) =>
      request('/snippets', { method: 'POST', body: JSON.stringify(payload) }),

    list: (params?: Record<string, any>) => {
      const q = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            q.set(k, String(v));
          }
        });
      }
      return request(`/snippets?${q.toString()}`);
    },

    get: (id: string) => request(`/snippets/${id}`),

    update: (id: string, payload: any) =>
      request(`/snippets/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

    delete: (id: string) => request(`/snippets/${id}`, { method: 'DELETE' }),

    getHistory: (id: string) => request(`/snippets/${id}/history`),

    rollback: (id: string, versionId: string) =>
      request(`/snippets/${id}/rollback/${versionId}`, { method: 'POST' }),
  },

  folders: {
    list: () => request('/folders'),
    create: (payload: { name: string; parentId?: string | null }) =>
      request('/folders', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: { name?: string; parentId?: string | null }) =>
      request(`/folders/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    delete: (id: string) => request(`/folders/${id}`, { method: 'DELETE' }),
  },

  tags: {
    list: () => request('/tags'),
  },

  exportImport: {
    export: () => request('/export-import/export'),
    import: (payload: { snippets: any[] }) =>
      request('/export-import/import', { method: 'POST', body: JSON.stringify(payload) }),
  },
};
