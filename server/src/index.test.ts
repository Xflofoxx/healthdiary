import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { v4 as uuid } from 'uuid';
import { getDuckDb } from '../src/db/duckdb';
import { getDb } from '../src/db/sqlite';
import app from '../src/index';

const BASE_URL = 'http://localhost';

describe('Health Routes', () => {
  test('GET /health returns healthy status', async () => {
    const res = await app.request('/health', { method: 'GET' });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('healthy');
    expect(data.services).toBeDefined();
    expect(data.services.sqlite).toBe('connected');
  });

  test('GET /health returns proper response structure', async () => {
    const res = await app.request('/health', { method: 'GET' });
    const data = await res.json();
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('services');
    expect(Number.isInteger(data.uptime)).toBe(true);
  });
});

describe('Root Route', () => {
  test('GET / returns HTML page', async () => {
    const res = await app.request('/', { method: 'GET' });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('<!DOCTYPE html>');
    expect(text).toContain('Healthdiary');
  });
});

describe('Illnesses Routes', () => {
  let testSessionId: string;
  let testUserId: string;
  let uniqueSuffix: number;

  beforeAll(() => {
    const db = getDb();
    uniqueSuffix = Date.now();
    testUserId = uuid();
    testSessionId = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (id, username, display_name, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(testUserId, `testuser_${uniqueSuffix}`, 'Test User');

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(testSessionId, testUserId, expiresAt);
  });

  test('GET /api/v1/illnesses returns 401 without auth', async () => {
    const res = await app.request('/api/v1/illnesses', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/illnesses returns array with auth', async () => {
    const res = await app.request('/api/v1/illnesses', {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.illnesses)).toBe(true);
    expect(data.total).toBeGreaterThan(0);
  });

  test('GET /api/v1/illnesses/:id returns 404 for non-existent', async () => {
    const res = await app.request('/api/v1/illnesses/nonexistent', {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/illnesses creates illness', async () => {
    const res = await app.request('/api/v1/illnesses', {
      method: 'POST',
      headers: {
        Cookie: `session=${testSessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Illness',
        notes: 'Test notes',
        startDate: '2024-01-01',
        status: 'active',
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe('Test Illness');
  });

  test('POST /api/v1/illnesses returns 400 without name', async () => {
    const res = await app.request('/api/v1/illnesses', {
      method: 'POST',
      headers: {
        Cookie: `session=${testSessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes: 'Test notes' }),
    });
    expect(res.status).toBe(400);
  });

  test('PUT /api/v1/illnesses/:id updates illness', async () => {
    const db = getDb();
    const illnessId = uuid();
    db.prepare(`
      INSERT INTO illnesses (id, name, notes, start_date, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(illnessId, 'Original', 'Original notes', '2024-01-01', 'active');

    const res = await app.request(`/api/v1/illnesses/${illnessId}`, {
      method: 'PUT',
      headers: {
        Cookie: `session=${testSessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated',
        startDate: '2024-01-01',
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Updated');
  });

  test('DELETE /api/v1/illnesses/:id deletes illness', async () => {
    const db = getDb();
    const illnessId = uuid();
    db.prepare(`
      INSERT INTO illnesses (id, name, notes, start_date, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(illnessId, 'ToDelete', 'notes', '2024-01-01', 'active');

    const res = await app.request(`/api/v1/illnesses/${illnessId}`, {
      method: 'DELETE',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
  });
});

describe('Prescriptions Routes', () => {
  let testSessionId: string;
  let testUserId: string;
  let uniqueSuffix: number;

  beforeAll(() => {
    const db = getDb();
    uniqueSuffix = Date.now();
    testUserId = uuid();
    testSessionId = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (id, username, display_name, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(testUserId, `testuser2_${uniqueSuffix}`, 'Test User 2');

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(testSessionId, testUserId, expiresAt);
  });

  test('GET /api/v1/prescriptions returns 401 without auth', async () => {
    const res = await app.request('/api/v1/prescriptions', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/prescriptions returns array with auth', async () => {
    const res = await app.request('/api/v1/prescriptions', {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.prescriptions)).toBe(true);
    expect(data.total).toBeGreaterThan(0);
  });

  test('POST /api/v1/prescriptions creates prescription', async () => {
    const res = await app.request('/api/v1/prescriptions', {
      method: 'POST',
      headers: {
        Cookie: `session=${testSessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medication: 'Aspirin',
        dosage: '100mg',
        frequency: 'Once daily',
        startDate: '2024-01-01',
        status: 'active',
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.medication).toBe('Aspirin');
  });
});

describe('Appointments Routes', () => {
  let testSessionId: string;
  let testUserId: string;
  let uniqueSuffix: number;

  beforeAll(() => {
    const db = getDb();
    uniqueSuffix = Date.now();
    testUserId = uuid();
    testSessionId = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (id, username, display_name, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(testUserId, `testuser3_${uniqueSuffix}`, 'Test User 3');

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(testSessionId, testUserId, expiresAt);
  });

  test('GET /api/v1/appointments returns 401 without auth', async () => {
    const res = await app.request('/api/v1/appointments', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/appointments returns array with auth', async () => {
    const res = await app.request('/api/v1/appointments', {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.appointments)).toBe(true);
    expect(data.total).toBeGreaterThan(0);
  });

  test('POST /api/v1/appointments creates appointment', async () => {
    const res = await app.request('/api/v1/appointments', {
      method: 'POST',
      headers: {
        Cookie: `session=${testSessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctorName: 'Dr. Smith',
        specialty: 'General',
        date: '2024-02-01',
        notes: 'Annual checkup',
        status: 'scheduled',
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.doctorName).toBe('Dr. Smith');
  });
});

describe('Auth Routes', () => {
  test('GET /api/v1/auth/register/options returns options', async () => {
    const res = await app.request('/api/v1/auth/register/options', { method: 'GET' });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('challenge');
    expect(data).toHaveProperty('user');
  });

  test('GET /api/v1/auth/login/options returns options', async () => {
    const res = await app.request('/api/v1/auth/login/options', { method: 'GET' });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('challenge');
  });

  test('GET /api/v1/auth/me returns 401 without session', async () => {
    const res = await app.request('/api/v1/auth/me', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/auth/logout returns success', async () => {
    const res = await app.request('/api/v1/auth/logout', { method: 'POST' });
    expect(res.status).toBe(200);
  });
});

describe('Database', () => {
  test('SQLite connection works', () => {
    const db = getDb();
    const result = db.prepare('SELECT 1 as value').get();
    expect(result).toEqual({ value: 1 });
  });

  test('DuckDB connection works', () => {
    const db = getDuckDb();
    db.run('SELECT 1');
    expect(true).toBe(true);
  });
});

describe('Error Handler', () => {
  test('Non-existent route returns 404', async () => {
    const res = await app.request('/api/v1/nonexistent', { method: 'GET' });
    expect(res.status).toBe(404);
  });
});

describe('Illnesses Search and Filter', () => {
  let testSessionId: string;
  let testUserId: string;
  let uniqueSuffix: number;

  beforeAll(() => {
    const db = getDb();
    uniqueSuffix = Date.now();
    testUserId = uuid();
    testSessionId = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (id, username, display_name, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(testUserId, `testuser_search_${uniqueSuffix}`, 'Search User');

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(testSessionId, testUserId, expiresAt);
  });

  test('GET /api/v1/illnesses with search query', async () => {
    const res = await app.request('/api/v1/illnesses?search=test', {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
  });

  test('GET /api/v1/illnesses with status filter', async () => {
    const res = await app.request('/api/v1/illnesses?status=active', {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
  });
});

describe('Auth Routes with Session', () => {
  let testSessionId: string;
  let testUserId: string;
  let uniqueSuffix: number;

  beforeAll(() => {
    const db = getDb();
    uniqueSuffix = Date.now();
    testUserId = uuid();
    testSessionId = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (id, username, display_name, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(testUserId, `testuser_session_${uniqueSuffix}`, 'Session User');

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(testSessionId, testUserId, expiresAt);
  });

  test('GET /api/v1/auth/me returns user with valid session', async () => {
    const res = await app.request('/api/v1/auth/me', {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('username');
  });

  test('POST /api/v1/auth/logout with session clears session', async () => {
    const res = await app.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
  });
});

describe('Prescriptions with illness', () => {
  let testSessionId: string;
  let testUserId: string;
  let illnessId: string;
  let uniqueSuffix: number;

  beforeAll(() => {
    const db = getDb();
    uniqueSuffix = Date.now();
    testUserId = uuid();
    testSessionId = uuid();
    illnessId = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (id, username, display_name, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(testUserId, `testuser_rx_${uniqueSuffix}`, 'Rx User');

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(testSessionId, testUserId, expiresAt);

    db.prepare(`
      INSERT INTO illnesses (id, name, start_date, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(illnessId, 'Test Illness', '2024-01-01', 'active');
  });

  test('POST /api/v1/prescriptions with illness_id', async () => {
    const res = await app.request('/api/v1/prescriptions', {
      method: 'POST',
      headers: {
        Cookie: `session=${testSessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medication: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'As needed',
        startDate: '2024-01-01',
        illnessId: illnessId,
        status: 'active',
      }),
    });
    expect(res.status).toBe(201);
  });

  test('GET /api/v1/prescriptions with illness_id filter', async () => {
    const res = await app.request(`/api/v1/prescriptions?illnessId=${illnessId}`, {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
  });

  test('GET /api/v1/prescriptions with active filter', async () => {
    const res = await app.request('/api/v1/prescriptions?active=true', {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
  });
});

describe('Appointments CRUD', () => {
  let testSessionId: string;
  let testUserId: string;
  let appointmentId: string;
  let uniqueSuffix: number;

  beforeAll(() => {
    const db = getDb();
    uniqueSuffix = Date.now();
    testUserId = uuid();
    testSessionId = uuid();
    appointmentId = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (id, username, display_name, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(testUserId, `testuser_appt_${uniqueSuffix}`, 'Appt User');

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(testSessionId, testUserId, expiresAt);

    db.prepare(`
      INSERT INTO appointments (id, doctor_name, specialty, date, time, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(appointmentId, 'Dr. Test', 'General', '2024-02-01', '10:00');
  });

  test('GET /api/v1/appointments/:id returns appointment', async () => {
    const res = await app.request(`/api/v1/appointments/${appointmentId}`, {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
  });

  test('GET /api/v1/appointments/:id returns 404 for non-existent', async () => {
    const res = await app.request('/api/v1/appointments/nonexistent', {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(404);
  });

  test('PUT /api/v1/appointments/:id updates appointment', async () => {
    const res = await app.request(`/api/v1/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        Cookie: `session=${testSessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doctorName: 'Dr. Updated' }),
    });
    expect(res.status).toBe(200);
  });

  test('DELETE /api/v1/appointments/:id deletes appointment', async () => {
    const res = await app.request(`/api/v1/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
  });
});

describe('Prescriptions CRUD', () => {
  let testSessionId: string;
  let testUserId: string;
  let prescriptionId: string;
  let uniqueSuffix: number;

  beforeAll(() => {
    const db = getDb();
    uniqueSuffix = Date.now();
    testUserId = uuid();
    testSessionId = uuid();
    prescriptionId = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (id, username, display_name, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(testUserId, `testuser_rx2_${uniqueSuffix}`, 'Rx2 User');

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(testSessionId, testUserId, expiresAt);

    db.prepare(`
      INSERT INTO prescriptions (id, medication, dosage, frequency, start_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(prescriptionId, 'TestMed', '100mg', 'Daily', '2024-01-01');
  });

  test('GET /api/v1/prescriptions/:id returns prescription', async () => {
    const res = await app.request(`/api/v1/prescriptions/${prescriptionId}`, {
      method: 'GET',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
  });

  test('PUT /api/v1/prescriptions/:id updates prescription', async () => {
    const res = await app.request(`/api/v1/prescriptions/${prescriptionId}`, {
      method: 'PUT',
      headers: {
        Cookie: `session=${testSessionId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dosage: '200mg',
        startDate: '2024-01-01',
      }),
    });
    expect(res.status).toBe(200);
  });

  test('DELETE /api/v1/prescriptions/:id deletes prescription', async () => {
    const res = await app.request(`/api/v1/prescriptions/${prescriptionId}`, {
      method: 'DELETE',
      headers: { Cookie: `session=${testSessionId}` },
    });
    expect(res.status).toBe(200);
  });
});
