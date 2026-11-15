const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4006';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexus_crm_token') : null;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || errorData.error?.message || errorData.error || `HTTP ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}
