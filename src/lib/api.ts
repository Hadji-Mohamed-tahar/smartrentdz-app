/**
 * API Configuration for SmartRent Backend
 */

const APP_URL = import.meta.env.VITE_APP_URL || import.meta.env.APP_URL || 'https://screensavers-hub-where-orleans.trycloudflare.com';

export const API_BASE_URL = `${APP_URL.replace(/\/$/, '')}/api`;

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Set auth token
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Remove auth token
 */
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Parse API error responses
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data.errors) {
      const messages = Object.values(data.errors).flat();
      return messages.join(', ');
    }
    return data.message || `خطأ ${response.status}`;
  } catch {
    return `خطأ ${response.status}`;
  }
}

/**
 * Generic fetch wrapper with error handling and auth
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Don't set Content-Type for GET/empty bodies or FormData to avoid unnecessary CORS preflights
  if (options?.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
      localStorage.removeItem('user_data');
    }
    const message = await parseErrorResponse(response);
    throw new Error(message);
  }

  return response.json();
}

/**
 * GET request
 */
export function apiGet<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'GET' });
}

/**
 * POST request (JSON)
 */
export function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * POST request (FormData - for file uploads)
 */
export function apiPostForm<T>(endpoint: string, formData: FormData): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: formData,
  });
}

/**
 * PUT request
 */
export function apiPut<T>(endpoint: string, data: unknown): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request
 */
export function apiPatch<T>(endpoint: string, data: unknown): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export function apiDelete<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'DELETE' });
}
