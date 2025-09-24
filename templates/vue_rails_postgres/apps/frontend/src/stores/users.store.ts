import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, CreateUserInput, UpdateUserInput } from '@/types';
import * as usersService from '@/services/users.service';
import { ApiError } from '@/services/api';
import { useAuthStore } from './auth.store';

/**
 * ユーザー管理ストア
 * ユーザーデータのCRUD操作と状態管理
 */
export const useUsersStore = defineStore('users', () => {
  // Auth store for error handling
  const authStore = useAuthStore();

  // State
  const users = ref<User[]>([]);
  const isInitialized = ref<boolean>(false);

  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const searchQuery = ref<string>('');
  const currentPage = ref<number>(1);
  const perPage = ref<number>(10);

  // Getters
  /**
   * 全ユーザー数
   */
  const totalUsers = computed(() => users.value.length);

  /**
   * 既存のメールアドレスリスト（重複チェック用）
   */
  const existingEmails = computed(() =>
    users.value.map(user => user.email.toLowerCase())
  );

  /**
   * 検索フィルタリングされたユーザー
   */
  const filteredUsers = computed(() => {
    if (!searchQuery.value) {
      return users.value;
    }

    const query = searchQuery.value.toLowerCase();
    return users.value.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  /**
   * ページネーション適用後のユーザー
   */
  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return filteredUsers.value.slice(start, end);
  });

  /**
   * 総ページ数
   */
  const totalPages = computed(() =>
    Math.ceil(filteredUsers.value.length / perPage.value)
  );

  // Actions
  /**
   * ユーザー追加
   * @param input ユーザー作成情報
   * @returns Promise<User> 作成されたユーザー
   */
  async function addUser(input: CreateUserInput): Promise<User> {
    loading.value = true;
    error.value = null;

    try {
      // APIを使用してユーザーを作成
      const newUser = await usersService.createUser({
        name: input.name.trim(),
        email: input.email.toLowerCase(),
        password: input.password
      });

      // ローカルステートを更新
      users.value.push(newUser);
      return newUser;
    } catch (err: any) {
      // 認証エラー時は認証ストアでナビゲーション処理
      if (err instanceof ApiError && err.status === 401) {
        authStore.handleAuthError();
        throw err;
      }
      error.value = err.message || 'ユーザーの追加に失敗しました。';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * ユーザー更新
   * @param id ユーザーID
   * @param input 更新情報
   * @returns Promise<User> 更新されたユーザー
   */
  async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
    loading.value = true;
    error.value = null;

    try {
      // APIを使用してユーザーを更新
      const updatedUser = await usersService.updateUser(id, {
        name: input.name.trim(),
        email: input.email.toLowerCase(),
        ...(input.password && { password: input.password })
      });

      // ローカルステートを更新
      const userIndex = users.value.findIndex(user => user.id === id);
      if (userIndex !== -1) {
        users.value[userIndex] = updatedUser;
      }

      return updatedUser;
    } catch (err: any) {
      // 認証エラー時は認証ストアでナビゲーション処理
      if (err instanceof ApiError && err.status === 401) {
        authStore.handleAuthError();
        throw err;
      }
      error.value = err.message || 'ユーザーの更新に失敗しました。';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * ユーザー削除
   * @param id ユーザーID
   */
  async function deleteUser(id: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // APIを使用してユーザーを削除
      await usersService.deleteUser(id);

      // ローカルステートから削除
      const userIndex = users.value.findIndex(user => user.id === id);
      if (userIndex !== -1) {
        users.value.splice(userIndex, 1);
      }

      // 削除後、現在のページに項目がない場合は前のページに戻る
      if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
    } catch (err: any) {
      // 認証エラー時は認証ストアでナビゲーション処理
      if (err instanceof ApiError && err.status === 401) {
        authStore.handleAuthError();
        throw err;
      }
      error.value = err.message || 'ユーザーの削除に失敗しました。';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * ユーザーをIDで取得
   * @param id ユーザーID
   * @returns User | undefined
   */
  function getUserById(id: string): User | undefined {
    return users.value.find(user => user.id === id);
  }

  /**
   * 検索クエリを設定
   * @param query 検索文字列
   */
  function setSearchQuery(query: string): void {
    searchQuery.value = query;
    currentPage.value = 1; // 検索時はページをリセット
  }

  /**
   * ページを設定
   * @param page ページ番号
   */
  function setCurrentPage(page: number): void {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value));
  }

  /**
   * ユーザー一覧を取得
   */
  async function fetchUsers(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // APIからユーザー一覧を取得
      const fetchedUsers = await usersService.getUsers();
      users.value = fetchedUsers;
      isInitialized.value = true;
    } catch (err: any) {
      // 認証エラー時は認証ストアでナビゲーション処理
      if (err instanceof ApiError && err.status === 401) {
        authStore.handleAuthError();
        return;
      }
      error.value = err.message || 'ユーザー一覧の取得に失敗しました。';
    } finally {
      loading.value = false;
    }
  }

  /**
   * エラーのクリア
   */
  function clearError(): void {
    error.value = null;
  }

  // 初期データの取得
  if (!isInitialized.value) {
    fetchUsers();
  }

  return {
    // State
    users,
    loading,
    error,
    searchQuery,
    currentPage,
    perPage,

    // Getters
    totalUsers,
    existingEmails,
    filteredUsers,
    paginatedUsers,
    totalPages,

    // Actions
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    setSearchQuery,
    setCurrentPage,
    clearError
  };
});