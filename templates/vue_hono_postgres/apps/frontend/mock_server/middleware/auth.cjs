/**
 * Json Server Authentication Middleware
 * Handles login, logout, and session management
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// In-memory session store (for development only)
const sessions = new Map();

// Generate session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware function
module.exports = (req, res, next) => {
  // CORS headers for development
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Login endpoint
  if (req.path === '/login' && req.method === 'POST') {
    const { email, password } = req.body;

    // Read users from database
    const dbPath = path.join(__dirname, '..', 'db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const user = db.users.find(u =>
      u.email === email && u.password === password
    );

    if (user) {
      // Create session
      const token = generateToken();
      const session = {
        token,
        userId: user.id,
        email: user.email,
        createdAt: new Date().toISOString()
      };

      sessions.set(token, session);

      // Return user data without password
      const { password: _, ...userData } = user;

      return res.status(200).json({
        success: true,
        data: {
          user: userData,
          token
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません。'
      });
    }
  }

  // Logout endpoint
  if (req.path === '/logout' && req.method === 'POST') {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      sessions.delete(token);
    }

    return res.status(200).json({
      success: true,
      message: 'ログアウトしました。'
    });
  }

  // Session check endpoint
  if (req.path === '/session' && req.method === 'GET') {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: '認証が必要です。'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'セッションが無効です。'
      });
    }

    // Get user data
    const dbPath = path.join(__dirname, '..', 'db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const user = db.users.find(u => u.id === session.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません。'
      });
    }

    const { password: _, ...userData } = user;

    return res.status(200).json({
      success: true,
      data: {
        user: userData,
        session: {
          createdAt: session.createdAt
        }
      }
    });
  }

  // Protect API routes (except login/logout/session)
  if (req.path.startsWith('/api/users') && req.method !== 'GET') {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: '認証が必要です。'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'セッションが無効です。'
      });
    }
  }

  // Continue to next middleware
  next();
};