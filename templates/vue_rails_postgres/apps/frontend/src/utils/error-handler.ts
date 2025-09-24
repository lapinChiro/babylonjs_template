/**
 * Global Error Handler
 * Provides centralized error handling and user-friendly messages
 */

import { ApiError } from '@/services/api';
import { toast } from 'vue-sonner';

/**
 * Error message mapping for common error types
 */
const ERROR_MESSAGES: Record<string, string> = {
  'Network Error': 'ネットワークエラーが発生しました。接続を確認してください。',
  'Timeout': 'リクエストがタイムアウトしました。しばらくしてからもう一度お試しください。',
  'Not Found': 'リソースが見つかりません。',
  'Forbidden': 'アクセス権限がありません。',
  'Bad Request': '不正なリクエストです。入力内容を確認してください。',
  'Internal Server Error': 'サーバーエラーが発生しました。しばらくしてからもう一度お試しください。',
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Check for mapped error messages
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.includes(key)) {
        return message;
      }
    }

    // Return API error message
    return error.message;
  }

  if (error instanceof Error) {
    // Check for mapped error messages
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.includes(key)) {
        return message;
      }
    }

    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return '予期しないエラーが発生しました。';
}

/**
 * Show error toast notification
 */
export function showError(error: unknown): void {
  const message = getErrorMessage(error);
  toast.error(message);
}

/**
 * Show success toast notification
 */
export function showSuccess(message: string): void {
  toast.success(message);
}

/**
 * Show info toast notification
 */
export function showInfo(message: string): void {
  toast.info(message);
}

/**
 * Show warning toast notification
 */
export function showWarning(message: string): void {
  toast.warning(message);
}

/**
 * Handle async errors with toast notifications
 */
export async function handleAsync<T>(
  promise: Promise<T>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showSuccess?: boolean;
  }
): Promise<T | null> {
  try {
    const result = await promise;

    if (options?.showSuccess !== false && options?.successMessage) {
      showSuccess(options.successMessage);
    }

    return result;
  } catch (error) {
    const message = options?.errorMessage || getErrorMessage(error);
    showError(message);
    return null;
  }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * factor, maxDelay);
      }
    }
  }

  throw lastError;
}