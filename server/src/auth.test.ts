import { beforeAll, describe, expect, test } from 'bun:test';
import { v4 as uuid } from 'uuid';
import { getDb } from '../src/db/sqlite';
import app from '../src/index';

describe('Auth Routes', () => {
  let sessionCookie: string;

  describe('Demo Login', () => {
    test('POST /api/v1/auth/login/demo returns success with valid credentials', async () => {
      const res = await app.request('/api/v1/auth/login/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'demo' }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.username).toBe('demo');

      // Get session cookie
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('session=');
      sessionCookie = setCookie ?? '';
    });

    test('POST /api/v1/auth/login/demo returns 401 with invalid credentials', async () => {
      const res = await app.request('/api/v1/auth/login/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'wrong' }),
      });
      expect(res.status).toBe(401);
    });

    test('POST /api/v1/auth/login/demo returns 401 with missing credentials', async () => {
      const res = await app.request('/api/v1/auth/login/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Session Management', () => {
    test('GET /api/v1/auth/me returns 401 without session', async () => {
      const res = await app.request('/api/v1/auth/me', { method: 'GET' });
      expect(res.status).toBe(401);
    });

    test('GET /api/v1/auth/me returns user with valid session', async () => {
      const res = await app.request('/api/v1/auth/me', {
        method: 'GET',
        headers: { Cookie: sessionCookie },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.username).toBe('demo');
    });

    test('POST /api/v1/auth/logout clears session', async () => {
      const res = await app.request('/api/v1/auth/logout', {
        method: 'POST',
        headers: { Cookie: sessionCookie },
      });
      expect(res.status).toBe(200);

      // Try to access protected route after logout
      const meRes = await app.request('/api/v1/auth/me', {
        method: 'GET',
        headers: { Cookie: sessionCookie },
      });
      expect(meRes.status).toBe(401);
    });
  });

  describe('WebAuthn Registration', () => {
    test('GET /api/v1/auth/register/options returns valid options', async () => {
      const res = await app.request('/api/v1/auth/register/options', { method: 'GET' });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.challenge).toBeDefined();
      expect(data.rp).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.pubKeyCredParams).toBeDefined();
    });

    test('POST /api/v1/auth/register/verify returns error with invalid data', async () => {
      const res = await app.request('/api/v1/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: { id: 'invalid' } }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('WebAuthn Login', () => {
    test('GET /api/v1/auth/login/options returns valid options', async () => {
      const res = await app.request('/api/v1/auth/login/options', { method: 'GET' });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.challenge).toBeDefined();
      expect(data.allowCredentials).toBeDefined();
    });

    test('POST /api/v1/auth/login/verify returns error with invalid data', async () => {
      const res = await app.request('/api/v1/auth/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: { id: 'nonexistent' } }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });
  });
});

describe('Protected Routes without Auth', () => {
  test('GET /api/v1/illnesses returns 401 without auth', async () => {
    const res = await app.request('/api/v1/illnesses', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/prescriptions returns 401 without auth', async () => {
    const res = await app.request('/api/v1/prescriptions', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/appointments returns 401 without auth', async () => {
    const res = await app.request('/api/v1/appointments', { method: 'GET' });
    expect(res.status).toBe(401);
  });
});

describe('Protected Routes with Auth', () => {
  let sessionCookie: string;

  beforeAll(async () => {
    const res = await app.request('/api/v1/auth/login/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'demo' }),
    });
    const setCookie = res.headers.get('set-cookie');
    sessionCookie = setCookie ?? '';
  });

  test('GET /api/v1/illnesses returns 200 with auth', async () => {
    const res = await app.request('/api/v1/illnesses', {
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });
    expect(res.status).toBe(200);
  });

  test('GET /api/v1/prescriptions returns 200 with auth', async () => {
    const res = await app.request('/api/v1/prescriptions', {
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });
    expect(res.status).toBe(200);
  });

  test('GET /api/v1/appointments returns 200 with auth', async () => {
    const res = await app.request('/api/v1/appointments', {
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });
    expect(res.status).toBe(200);
  });
});

describe('Doctors Routes', () => {
  let sessionCookie: string;

  beforeAll(async () => {
    const res = await app.request('/api/v1/auth/login/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'demo' }),
    });
    const setCookie = res.headers.get('set-cookie');
    sessionCookie = setCookie ?? '';
  });

  test('GET /api/v1/doctors returns 401 without auth', async () => {
    const res = await app.request('/api/v1/doctors', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/doctors returns 200 with auth', async () => {
    const res = await app.request('/api/v1/doctors', {
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.doctors).toBeDefined();
  });

  test('POST /api/v1/doctors creates doctor', async () => {
    const res = await app.request('/api/v1/doctors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        name: 'Dr. Test',
        specialty: 'Cardiology',
        phone: '123456789',
        email: 'test@example.com',
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe('Dr. Test');
    expect(data.specialty).toBe('Cardiology');
  });

  test('POST /api/v1/doctors returns 400 without name', async () => {
    const res = await app.request('/api/v1/doctors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ specialty: 'Test' }),
    });
    expect(res.status).toBe(400);
  });
});
