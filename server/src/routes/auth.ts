import {
  type VerifiedAuthenticationResponse,
  type VerifiedRegistrationResponse,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/sqlite';
import type { Credential, Session, User } from '../models/auth';

const RP_ID = 'localhost';
const RP_NAME = 'Healthdiary';
const ORIGIN = 'http://localhost:4200';

const authRouter = new Hono();

authRouter.get('/register/options', async (c) => {
  const db = getDb();

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: uuid(),
    userName: `user_${Date.now()}`,
    attestationType: 'none',
    supportedAlgorithmIDs: [-7, -257],
  });

  const challengeId = uuid();
  const tempUser = { id: options.user.id, username: options.user.name };

  db.prepare(`
    INSERT INTO temp_challenges (id, challenge, user_data, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(challengeId, options.challenge, JSON.stringify(tempUser));

  setTimeout(
    () => {
      db.prepare('DELETE FROM temp_challenges WHERE id = ?').run(challengeId);
    },
    5 * 60 * 1000
  );

  return c.json(options);
});

authRouter.post('/register/verify', async (c) => {
  const body = await c.req.json();
  const db = getDb();

  const challengeRow = db
    .prepare('SELECT * FROM temp_challenges WHERE user_data LIKE ?')
    .get(`%${body.expected.userID}%`) as
    | { id: string; challenge: string; user_data: string }
    | undefined;

  if (!challengeRow) {
    return c.json({ error: 'Challenge not found or expired' }, 400);
  }

  let verification: VerifiedRegistrationResponse;

  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });
  } catch (err) {
    console.error('Verification error:', err);
    return c.json({ error: 'Verification failed' }, 400);
  }

  if (verification.verified && verification.registrationInfo) {
    const userId = uuid();
    const username = `user_${Date.now()}`;

    db.prepare(`
      INSERT INTO users (id, username, display_name, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(userId, username, body.displayName || username);

    db.prepare(`
      INSERT INTO credentials (id, user_id, credential_id, public_key, counter, device_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      uuid(),
      userId,
      verification.registrationInfo.credentialID,
      JSON.stringify(verification.registrationInfo.credentialPublicKey),
      verification.registrationInfo.counter,
      verification.registrationInfo.credentialDeviceType
    );

    const sessionId = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(sessionId, userId, expiresAt);

    db.prepare('DELETE FROM temp_challenges WHERE id = ?').run(challengeRow.id);

    c.header(
      'Set-Cookie',
      `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
    );

    return c.json({ success: true, userId });
  }

  return c.json({ error: 'Registration failed' }, 400);
});

authRouter.get('/login/options', async (c) => {
  const db = getDb();
  const users = db.prepare('SELECT id, username, display_name FROM users').all() as User[];

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: users.flatMap((user) => {
      const creds = db
        .prepare('SELECT credential_id FROM credentials WHERE user_id = ?')
        .all(user.id) as { credential_id: string }[];
      return creds.map((cred) => ({
        id: cred.credential_id,
        type: 'public-key',
      }));
    }),
  });

  const challengeId = uuid();
  db.prepare(`
    INSERT INTO temp_challenges (id, challenge, created_at)
    VALUES (?, ?, datetime('now'))
  `).run(challengeId, options.challenge);

  setTimeout(
    () => {
      db.prepare('DELETE FROM temp_challenges WHERE id = ?').run(challengeId);
    },
    5 * 60 * 1000
  );

  return c.json(options);
});

authRouter.post('/login/verify', async (c) => {
  const body = await c.req.json();
  const db = getDb();

  const challengeRow = db
    .prepare('SELECT * FROM temp_challenges ORDER BY created_at DESC LIMIT 1')
    .get() as { id: string; challenge: string } | undefined;

  if (!challengeRow) {
    return c.json({ error: 'Challenge not found or expired' }, 400);
  }

  const credId = body.response.id;
  const credential = db.prepare('SELECT * FROM credentials WHERE credential_id = ?').get(credId) as
    | Credential
    | undefined;

  if (!credential) {
    return c.json({ error: 'Credential not found' }, 400);
  }

  let verification: VerifiedAuthenticationResponse;

  try {
    verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: credential.credential_id,
        credentialPublicKey: JSON.parse(credential.public_key),
        counter: credential.counter,
      },
    });
  } catch (err) {
    console.error('Verification error:', err);
    return c.json({ error: 'Verification failed' }, 400);
  }

  if (verification.verified) {
    db.prepare('UPDATE credentials SET counter = ? WHERE credential_id = ?').run(
      verification.authenticationInfo.newCounter,
      credId
    );

    const sessionId = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(sessionId, credential.user_id, expiresAt);

    db.prepare('DELETE FROM temp_challenges WHERE id = ?').run(challengeRow.id);

    c.header(
      'Set-Cookie',
      `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
    );

    return c.json({ success: true });
  }

  return c.json({ error: 'Authentication failed' }, 400);
});

authRouter.post('/logout', (c) => {
  const sessionId = getCookie(c, 'session');

  if (sessionId) {
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  }

  c.header('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');

  return c.json({ success: true });
});

authRouter.get('/me', (c) => {
  const sessionId = getCookie(c, 'session');

  if (!sessionId) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const db = getDb();
  const session = db
    .prepare(`
    SELECT s.*, u.username, u.display_name 
    FROM sessions s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `)
    .get(sessionId) as (Session & { username: string; display_name: string }) | undefined;

  if (!session) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }

  return c.json({
    id: session.user_id,
    username: session.username,
    displayName: session.display_name,
  });
});

export default authRouter;
