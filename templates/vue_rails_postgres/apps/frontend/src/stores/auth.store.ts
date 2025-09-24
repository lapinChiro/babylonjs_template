import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LoginCredentials, AuthState } from '@/types';
import * as authService from '@/services/auth.service';
import { getStoredToken } from '@/services/api';

/**
 * 認証ストア
 * ユーザーのログイン状態と認証処理を管理
 */
export const useAuthStore = defineStore('auth', () => {

  // State
  const isLoggedIn = ref<boolean>(false);
  const currentUser = ref<{ id: number; name: string; email: string } | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const isInitialized = ref<boolean>(false); // 認証状態復元の完了フラグ

  // Getters
  const authState = computed<AuthState>(() => ({
    isLoggedIn: isLoggedIn.value,
    currentUser: currentUser.value || undefined,
    loading: loading.value,
    error: error.value ? { message: error.value } : null
  }));

  // Actions
  /**
   * ログイン処理
   * @param credentials ログイン認証情報
   * @returns Promise<boolean> ログイン成功の可否
   */
  async function login(credentials: LoginCredentials): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      // APIを使用したログイン処理
      const response = await authService.login({
        email: credentials.email,
        password: credentials.password
      });

      if (response && response.user) {
        isLoggedIn.value = true;
        currentUser.value = response.user;
        isInitialized.value = true;

        // LocalStorageにユーザー情報を保存（トークンはAPIクライアントで管理）
        localStorage.setItem('auth:isLoggedIn', 'true');
        localStorage.setItem('auth:currentUser', JSON.stringify(response.user));

        return true;
      }

      error.value = 'ログインに失敗しました';
      return false;
    } catch (err: any) {
      error.value = err.message || 'ログイン処理中にエラーが発生しました。';
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * ログアウト処理
   */
  async function logout(): Promise<void> {
    try {
      // APIを使用したログアウト処理
      await authService.logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      isLoggedIn.value = false;
      currentUser.value = null;
      error.value = null;
      isInitialized.value = true; // ログアウト後は初期化済み状態にする

      // LocalStorageから削除
      localStorage.removeItem('auth:isLoggedIn');
      localStorage.removeItem('auth:currentUser');
    }
  }

  /**
   * 認証状態の復元（初期化時）
   */
  async function restoreAuthState(): Promise<void> {
    try {
      const token = getStoredToken();
      const storedCurrentUser = localStorage.getItem('auth:currentUser');

      if (token && storedCurrentUser) {
        try {
          // 保存されたユーザー情報を一時的に復元
          const userData = JSON.parse(storedCurrentUser);
          isLoggedIn.value = true;
          currentUser.value = userData;

          // バックグラウンドでセッション確認
          const session = await authService.checkSession();

          if (session && session.user) {
            // セッション有効 - ユーザー情報を最新に更新
            currentUser.value = session.user;
            localStorage.setItem('auth:currentUser', JSON.stringify(session.user));
          } else {
            // セッションが無効な場合は静かにクリア
            isLoggedIn.value = false;
            currentUser.value = null;
            localStorage.removeItem('auth:isLoggedIn');
            localStorage.removeItem('auth:currentUser');
          }
        } catch (err) {
          // セッション確認でエラーが発生した場合も静かにクリア
          isLoggedIn.value = false;
          currentUser.value = null;
          localStorage.removeItem('auth:isLoggedIn');
          localStorage.removeItem('auth:currentUser');
        }
      }
    } finally {
      // 初期化完了をマーク
      isInitialized.value = true;
    }
  }

  /**
   * 認証エラー時の状態クリア処理
   */
  function handleAuthError(): void {
    isLoggedIn.value = false;
    currentUser.value = null;
    error.value = null;
    isInitialized.value = true;

    // LocalStorageから削除
    localStorage.removeItem('auth:isLoggedIn');
    localStorage.removeItem('auth:currentUser');

    // ナビゲーションはルーターガードで処理される
  }

  /**
   * エラーのクリア
   */
  function clearError(): void {
    error.value = null;
  }

  return {
    // State
    isLoggedIn,
    currentUser,
    loading,
    error,
    isInitialized,

    // Getters
    authState,

    // Actions
    login,
    logout,
    restoreAuthState,
    handleAuthError,
    clearError
  };
});