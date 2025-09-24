import { z } from '@hono/zod-openapi'

// メインアイテムスキーマ
export const ItemSchema = z.object({
  id: z.string().openapi({ example: '1' }),
  name: z.string().openapi({ example: 'MacBook Pro' }),
  created_at: z.string().datetime().openapi({ example: '2024-01-01T00:00:00Z' }),
  updated_at: z.string().datetime().openapi({ example: '2024-01-01T00:00:00Z' })
}).openapi('Item')

// アイテム作成用スキーマ
export const CreateItemSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(255, '名前は255文字以内で入力してください').openapi({ example: 'iPad Air' })
}).openapi('CreateItem')

// アイテム更新用スキーマ
export const UpdateItemSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(255, '名前は255文字以内で入力してください').optional().openapi({ example: 'iPhone 15 Pro' })
}).openapi('UpdateItem')

// パスパラメータ用スキーマ
export const ItemParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'IDは数値である必要があります').openapi({
    param: { name: 'id', in: 'path' },
    example: '1'
  })
})

// アイテムリスト用スキーマ
export const ItemListSchema = z.array(ItemSchema).openapi('ItemList')