const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) handleExpiredSession(path);
    throw new ApiError(res.status, body.message ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const REDIRECT_FLAG = 'nt_auth_redirect';

function handleExpiredSession(path: string) {
  if (typeof window === 'undefined' || path.startsWith('/auth/')) return;
  if (window.location.pathname === '/login') return;
  if (sessionStorage.getItem(REDIRECT_FLAG)) return;
  sessionStorage.setItem(REDIRECT_FLAG, '1');

  fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).finally(() => window.location.assign('/login'));
}

export function clearAuthRedirectFlag() {
  if (typeof window !== 'undefined') sessionStorage.removeItem(REDIRECT_FLAG);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : '';
}

export { API_URL };
