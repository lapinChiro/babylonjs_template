import type { Context, Next } from 'hono'
import { verifyJWT } from '../utils/auth.js'
import { db } from '../db/connection.js'

/**
 * Authentication middleware for protected routes
 * Verifies Bearer token and attaches user to context
 */
export async function authMiddleware(c: Context, next: Next) {
  const authorization = c.req.header('Authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  // Extract token from "Bearer <token>" format
  const token = authorization.slice(7)
  const payload = await verifyJWT(token)

  if (!payload) {
    return c.json({ success: false, error: 'Invalid token' }, 401)
  }

  // Fetch user information from database
  const user = await db
    .selectFrom('users')
    .select(['id', 'name', 'email'])
    .where('id', '=', payload.userId)
    .where('active', '=', true)
    .executeTakeFirst()

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 401)
  }

  // Attach user to context for use in route handlers
  ;(c as any).set('user', user)
  await next()
}