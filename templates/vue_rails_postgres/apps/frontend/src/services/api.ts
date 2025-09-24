/**
 * API Client Configuration
 * Using ofetch for lightweight HTTP requests
 */
import { ofetch } from 'ofetch';
import type { FetchOptions } from 'ofetch';

// API Base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Token storage key
const TOKEN_KEY = 'auth:token';

/**
 * Get stored authentication token
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store authentication token
 */
export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove stored authentication token
 */
export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * API Error class for consistent error handling
 */
export class ApiError extends Error {
  public status?: number;
  public data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Create ofetch instance with default configuration
 */
export const api = ofetch.create({
  baseURL: API_BASE_URL,

  // Add authentication header if token exists
  onRequest(ctx) {
    const token = getStoredToken();
    if (token) {
      const headers = ctx.options.headers || {};
      (ctx.options.headers as any) = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }
  },

  // Handle response errors
  onResponseError(ctx) {
    const { response } = ctx;
    const error = response._data;

    // Handle authentication errors
    if (response.status === 401) {
      // セッション確認のリクエストの場合はトークンを削除しない
      const isSessionCheck = ctx.request.toString().includes('/auth/session');

      if (!isSessionCheck) {
        removeStoredToken();
      }

      throw new ApiError(
        error?.error || '認証エラーが発生しました',
        response.status,
        error
      );
    }

    // Handle conflict errors (duplicate email, etc.)
    if (response.status === 409) {
      throw new ApiError(
        error?.error || error?.message || 'リソースの競合が発生しました',
        response.status,
        error
      );
    }

    // Handle other errors
    throw new ApiError(
      error?.error || error?.message || 'エラーが発生しました',
      response.status,
      error
    );
  },
});

/**
 * Generic API response type
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Make authenticated API request
 */
export async function apiRequest<T = unknown>(
  url: string,
  options?: FetchOptions
): Promise<T> {
  try {
    const response = await api(url, options);

    // Handle response format
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data as T;
    }

    return response as T;
  } catch (error) {
    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}