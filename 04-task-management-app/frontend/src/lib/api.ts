const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/api/v1';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('tradeo_task_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiRequest('/auth/me'),

  // Categories
  getCategories: () => apiRequest('/categories'),
  createCategory: (payload: any) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id: string, payload: any) => apiRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCategory: (id: string) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/tasks${query ? `?${query}` : ''}`);
  },
  getTask: (id: string) => apiRequest(`/tasks/${id}`),
  createTask: (payload: any) => apiRequest('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  updateTask: (id: string, payload: any) => apiRequest(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteTask: (id: string) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),

  // Subtasks
  createSubtask: (taskId: string, title: string) =>
    apiRequest(`/subtasks/${taskId}`, { method: 'POST', body: JSON.stringify({ title }) }),
  toggleSubtask: (id: string) =>
    apiRequest(`/subtasks/${id}/toggle`, { method: 'PATCH' }),
  deleteSubtask: (id: string) =>
    apiRequest(`/subtasks/${id}`, { method: 'DELETE' }),

  // Analytics
  getSummary: () => apiRequest('/analytics/summary'),
};
