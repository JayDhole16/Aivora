import { type ApiError } from '@/types';
import { toast } from 'sonner';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export { USE_MOCKS, BASE_URL };

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      statusCode: res.status,
      message: 'Something went wrong. Please try again.',
      error: 'Unknown error',
    }));
    toast.error(err.message);
    throw err;
  }

  return res.json() as Promise<T>;
}

/** Wraps mock data with a realistic network delay */
export async function mockResponse<T>(data: T, ms = 600): Promise<T> {
  await new Promise((r) => setTimeout(r, ms));
  return data;
}
