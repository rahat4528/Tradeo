const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const ROOT_URL = process.env.NEXT_PUBLIC_ROOT_URL || 'http://localhost:4000';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('tradeo_token');
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

  links: {
    create: (payload: {
      targetUrl: string;
      customAlias?: string;
      description?: string;
      password?: string;
      expiresAt?: string;
      redirectCode?: number;
      domainId?: string;
    }) => request('/links', { method: 'POST', body: JSON.stringify(payload) }),

    list: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; order?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.search) q.set('search', params.search);
      if (params?.sortBy) q.set('sortBy', params.sortBy);
      if (params?.order) q.set('order', params.order);
      return request(`/links?${q.toString()}`);
    },

    get: (id: string) => request(`/links/${id}`),

    update: (id: string, payload: any) =>
      request(`/links/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

    delete: (id: string) => request(`/links/${id}`, { method: 'DELETE' }),
  },

  analytics: {
    overview: () => request('/analytics/overview'),
    getForLink: (id: string, period = '30d') =>
      request(`/analytics/links/${id}?period=${period}`),
  },

  domains: {
    list: () => request('/domains'),
    create: (payload: { domain: string; fallbackUrl?: string }) =>
      request('/domains', { method: 'POST', body: JSON.stringify(payload) }),
    delete: (id: string) => request(`/domains/${id}`, { method: 'DELETE' }),
  },

  qr: {
    getUrl: (slug: string, format = 'svg', size = 300) =>
      `${ROOT_URL}/qr/${slug}?format=${format}&size=${size}`,
  },

  redirect: {
    verifyPassword: (slug: string, password: string) =>
      request(`${ROOT_URL}/r/${slug}/verify`, { method: 'POST', body: JSON.stringify({ password }) }),
  },
};
