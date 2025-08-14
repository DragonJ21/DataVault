import { queryClient } from './queryClient';

export interface ApiError {
  message: string;
  status?: number;
}

export class ApiErrorClass extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export async function apiCall<T>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const token = localStorage.getItem('auth-token');
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new ApiErrorClass(errorData.message || 'Request failed', response.status);
  }

  return response.json();
}

export const api = {
  get: <T>(url: string) => apiCall<T>('GET', url),
  post: <T>(url: string, data?: unknown) => apiCall<T>('POST', url, data),
  put: <T>(url: string, data?: unknown) => apiCall<T>('PUT', url, data),
  delete: <T>(url: string) => apiCall<T>('DELETE', url),
};

export function invalidateQueries(pattern: string[]) {
  queryClient.invalidateQueries({ queryKey: pattern });
}
