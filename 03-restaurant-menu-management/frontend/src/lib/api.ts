const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('tradeo_menu_token') : null;

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

  // Restaurant
  getRestaurant: () => apiRequest('/restaurant'),
  updateRestaurant: (payload: any) => apiRequest('/restaurant', { method: 'PATCH', body: JSON.stringify(payload) }),

  // Menus
  getMenus: () => apiRequest('/menus'),
  getMenu: (id: string) => apiRequest(`/menus/${id}`),
  createMenu: (payload: any) => apiRequest('/menus', { method: 'POST', body: JSON.stringify(payload) }),
  updateMenu: (id: string, payload: any) => apiRequest(`/menus/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMenu: (id: string) => apiRequest(`/menus/${id}`, { method: 'DELETE' }),

  // Categories
  createCategory: (payload: any) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id: string, payload: any) => apiRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCategory: (id: string) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),

  // Items
  createItem: (payload: any) => apiRequest('/items', { method: 'POST', body: JSON.stringify(payload) }),
  updateItem: (id: string, payload: any) => apiRequest(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  toggleAvailability: (id: string) => apiRequest(`/items/${id}/toggle-availability`, { method: 'PATCH' }),
  deleteItem: (id: string) => apiRequest(`/items/${id}`, { method: 'DELETE' }),

  // Public
  getPublicMenu: (slug: string) => apiRequest(`/public/menu/${slug}`),
  getQrCodeUrl: (slug: string, options: { table?: string; format?: string } = {}) => {
    const params = new URLSearchParams();
    if (options.table) params.append('table', options.table);
    if (options.format) params.append('format', options.format);
    const queryString = params.toString();
    return `${API_BASE}/public/qr/${slug}${queryString ? `?${queryString}` : ''}`;
  },
};
