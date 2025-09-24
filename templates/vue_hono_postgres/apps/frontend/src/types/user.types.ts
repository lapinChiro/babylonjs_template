/**
 * ユーザーエンティティの型定義
 */
export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * ユーザー作成時の入力データ
 */
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

/**
 * ユーザー更新時の入力データ
 */
export interface UpdateUserInput {
  name: string;
  email: string;
  password?: string;
}