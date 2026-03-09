import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { getDb } from '../db/sqlite';

export interface AuthVariables {
  userId: string;
  username: string;
  displayName: string;
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const sessionId = getCookie(c, 'session');

  if (!sessionId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const db = getDb();
  const session = db
    .prepare(`
    SELECT s.*, u.username, u.display_name 
    FROM sessions s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `)
    .get(sessionId) as { user_id: string; username: string; display_name: string } | undefined;

  if (!session) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }

  c.set('userId', session.user_id);
  c.set('username', session.username);
  c.set('displayName', session.display_name || session.username);

  await next();
};
