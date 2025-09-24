/**
 * Users Service
 * Handles all user-related API calls
 */
import { api, ApiError } from './api';
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  PaginationParams,
} from '@/types';

/**
 * Get all users
 */
export async function getUsers(params?: PaginationParams): Promise<UserResponse[]> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append('_page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('_limit', params.limit.toString());
    }
    if (params?.sort) {
      queryParams.append('_sort', params.sort);
    }
    if (params?.order) {
      queryParams.append('_order', params.order);
    }

    const query = queryParams.toString();
    const url = `/users${query ? `?${query}` : ''}`;

    const users = await api<UserResponse[]>(url, {
      method: 'GET',
    });

    return users;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('ユーザー一覧の取得に失敗しました');
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<UserResponse> {
  try {
    const user = await api<UserResponse>(`/users/${id}`, {
      method: 'GET',
    });

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('ユーザー情報の取得に失敗しました');
  }
}

/**
 * Create new user
 */
export async function createUser(data: CreateUserRequest): Promise<UserResponse> {
  try {
    const user = await api<UserResponse>('/users', {
      method: 'POST',
      body: data,
    });

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('ユーザーの作成に失敗しました');
  }
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<UserResponse> {
  try {
    const user = await api<UserResponse>(`/users/${id}`, {
      method: 'PUT',
      body: data,
    });

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('ユーザー情報の更新に失敗しました');
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await api(`/users/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('ユーザーの削除に失敗しました');
  }
}

/**
 * Search users by query
 */
export async function searchUsers(query: string): Promise<UserResponse[]> {
  try {
    const users = await api<UserResponse[]>(`/users?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });

    return users;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('ユーザーの検索に失敗しました');
  }
}