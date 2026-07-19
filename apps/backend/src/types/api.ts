// APIレスポンス共通型
export interface ApiResponse<T> {
  success?: boolean
  data?: T
  message?: string
  error?: string
}

// 実行時に利用可能な型定義（Zodスキーマから推論）
export interface User {
  id: string
  name: string
  email: string
  active: boolean
  created_at: string
}

export interface CreateUser {
  name: string
  email: string
}

export interface UpdateUser {
  name?: string
  email?: string
  active?: boolean
}

export type UserList = User[]