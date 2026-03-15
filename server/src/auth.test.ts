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

  test('GET /api/v1/doctors/:id returns doctor', async () => {
    const res = await app.request('/api/v1/doctors', {
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });
    const data = await res.json();
    const doctorId = data.doctors[0]?.id;

    if (doctorId) {
      const res2 = await app.request(`/api/v1/doctors/${doctorId}`, {
        method: 'GET',
        headers: { Cookie: sessionCookie },
      });
      expect(res2.status).toBe(200);
    }
  });

  test('GET /api/v1/doctors/:id returns 404 for nonexistent', async () => {
    const res = await app.request('/api/v1/doctors/nonexistent-id', {
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });
    expect(res.status).toBe(404);
  });

  test('PUT /api/v1/doctors/:id updates doctor', async () => {
    const res = await app.request('/api/v1/doctors', {
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });
    const data = await res.json();
    const doctorId = data.doctors[0]?.id;

    if (doctorId) {
      const res2 = await app.request(`/api/v1/doctors/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({ name: 'Updated Doctor', specialty: 'Neurology' }),
      });
      expect(res2.status).toBe(200);
      const updated = await res2.json();
      expect(updated.name).toBe('Updated Doctor');
    }
  });

  test('DELETE /api/v1/doctors/:id deletes doctor', async () => {
    const res = await app.request('/api/v1/doctors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ name: 'To Delete' }),
    });
    const newDoctor = await res.json();

    const res2 = await app.request(`/api/v1/doctors/${newDoctor.id}`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
    expect(res2.status).toBe(200);
  });

  describe('Profile Routes', () => {
    test('GET /api/v1/profile returns 401 without auth', async () => {
      const res = await app.request('/api/v1/profile', { method: 'GET' });
      expect(res.status).toBe(401);
    });

    test('GET /api/v1/profile returns profile', async () => {
      const res = await app.request('/api/v1/profile', {
        method: 'GET',
        headers: { Cookie: sessionCookie },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toBeDefined();
    });

    test('PUT /api/v1/profile updates profile', async () => {
      const res = await app.request('/api/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          birthDate: '1990-01-01',
          bloodType: 'A+',
          height: 175,
          weight: 70,
          allergies: 'Pollen',
          chronicConditions: 'None',
          emergencyContactName: 'John Doe',
          emergencyContactPhone: '1234567890',
          emergencyContactRelationship: 'Spouse',
          notes: 'Test notes',
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.birthDate).toBe('1990-01-01');
      expect(data.bloodType).toBe('A+');
      expect(data.height).toBe(175);
      expect(data.weight).toBe(70);
    });
  });

  describe('Data Routes', () => {
    test('GET /api/v1/data/export returns 401 without auth', async () => {
      const res = await app.request('/api/v1/data/export', { method: 'GET' });
      expect(res.status).toBe(401);
    });

    test('GET /api/v1/data/export exports data', async () => {
      const res = await app.request('/api/v1/data/export', {
        method: 'GET',
        headers: { Cookie: sessionCookie },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.version).toBeDefined();
      expect(data.data).toBeDefined();
    });

    test('POST /api/v1/data/import returns 401 without auth', async () => {
      const res = await app.request('/api/v1/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: {} }),
      });
      expect(res.status).toBe(401);
    });

    test('POST /api/v1/data/import imports data', async () => {
      const res = await app.request('/api/v1/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          version: '1.2.0',
          data: {
            illnesses: [],
            prescriptions: [],
            appointments: [],
            doctors: [],
            profile: null,
          },
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    test('POST /api/v1/data/import imports illnesses', async () => {
      const res = await app.request('/api/v1/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          version: '1.2.0',
          data: {
            illnesses: [
              {
                id: 'test-illness-1',
                name: 'Test Illness',
                notes: 'Test notes',
                start_date: '2024-01-01',
                end_date: '2024-01-15',
                status: 'resolved',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
            ],
            prescriptions: [],
            appointments: [],
            doctors: [],
            profile: null,
          },
        }),
      });
      expect(res.status).toBe(200);
    });

    test('POST /api/v1/data/import imports doctors', async () => {
      const res = await app.request('/api/v1/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          version: '1.2.0',
          data: {
            illnesses: [],
            prescriptions: [],
            appointments: [],
            doctors: [
              {
                id: 'test-doctor-1',
                name: 'Dr. Smith',
                specialty: 'Cardiology',
                phone: '123456',
                email: 'smith@test.com',
                address: '123 Test St',
                notes: 'Test doctor',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
            ],
            profile: null,
          },
        }),
      });
      expect(res.status).toBe(200);
    });

    test('POST /api/v1/data/import imports prescriptions', async () => {
      const res = await app.request('/api/v1/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          version: '1.2.0',
          data: {
            illnesses: [],
            prescriptions: [
              {
                id: 'test-rx-1',
                medication: 'Aspirin',
                dosage: '100mg',
                frequency: 'Once daily',
                start_date: '2024-01-01',
                end_date: null,
                notes: 'Test prescription',
                illness_id: null,
                doctor_id: null,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
            ],
            appointments: [],
            doctors: [],
            profile: null,
          },
        }),
      });
      expect(res.status).toBe(200);
    });

    test('POST /api/v1/data/import imports appointments', async () => {
      const res = await app.request('/api/v1/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          version: '1.2.0',
          data: {
            illnesses: [],
            prescriptions: [],
            appointments: [
              {
                id: 'test-apt-1',
                doctor_name: 'Dr. Jones',
                specialty: 'General',
                date: '2024-06-01',
                time: '10:00',
                location: 'Clinic',
                notes: 'Test appointment',
                illness_id: null,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
            ],
            doctors: [],
            profile: null,
          },
        }),
      });
      expect(res.status).toBe(200);
    });

    test('POST /api/v1/data/import imports profile', async () => {
      const res = await app.request('/api/v1/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          version: '1.2.0',
          data: {
            illnesses: [],
            prescriptions: [],
            appointments: [],
            doctors: [],
            profile: {
              birth_date: '1990-01-01',
              blood_type: 'B+',
              height: 180,
              weight: 75,
              allergies: 'Peanuts',
              chronic_conditions: 'Asthma',
              emergency_contact_name: 'Jane Doe',
              emergency_contact_phone: '9876543210',
              emergency_contact_relationship: 'Sister',
              notes: 'Imported profile',
            },
          },
        }),
      });
      expect(res.status).toBe(200);
    });

    test('POST /api/v1/data/import with text body', async () => {
      const res = await app.request('/api/v1/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          version: '1.2.0',
          data: { illnesses: [], prescriptions: [], appointments: [], doctors: [], profile: null },
        }),
      });
      expect(res.status).toBe(200);
    });

    test('POST /api/v1/data/import returns 400 for invalid format', async () => {
      const res = await app.request('/api/v1/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('Data Reset', () => {
    test('POST /api/v1/data/reset returns 401 without auth', async () => {
      const res = await app.request('/api/v1/data/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET' }),
      });
      expect(res.status).toBe(401);
    });

    test('POST /api/v1/data/reset returns 400 without correct confirmation', async () => {
      const res = await app.request('/api/v1/data/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({ confirm: 'wrong' }),
      });
      expect(res.status).toBe(400);
    });

    test('POST /api/v1/data/reset resets database', async () => {
      const res = await app.request('/api/v1/data/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({ confirm: 'RESET' }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Report Routes', () => {
    test('GET /api/v1/report returns 401 without auth', async () => {
      const res = await app.request('/api/v1/report', { method: 'GET' });
      expect(res.status).toBe(401);
    });

    test('GET /api/v1/report returns HTML', async () => {
      const loginRes = await app.request('/api/v1/auth/login/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'demo' }),
      });
      const cookie = loginRes.headers.get('set-cookie');
      
      const res = await app.request('/api/v1/report', {
        method: 'GET',
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Illness edge cases', () => {
    test('GET /api/v1/illnesses with search', async () => {
      const loginRes = await app.request('/api/v1/auth/login/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'demo' }),
      });
      const cookie = loginRes.headers.get('set-cookie');
      
      const res = await app.request('/api/v1/illnesses?search=test', {
        method: 'GET',
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Prescription edge cases', () => {
    test('GET /api/v1/prescriptions/:id returns 404 for nonexistent', async () => {
      const loginRes = await app.request('/api/v1/auth/login/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'demo' }),
      });
      const cookie = loginRes.headers.get('set-cookie');

      const res = await app.request('/api/v1/prescriptions/nonexistent-id-123', {
        method: 'GET',
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(404);
    });

    test('PUT /api/v1/prescriptions/:id returns 404 for nonexistent', async () => {
      const loginRes = await app.request('/api/v1/auth/login/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'demo' }),
      });
      const cookie = loginRes.headers.get('set-cookie');

      const res = await app.request('/api/v1/prescriptions/nonexistent-id-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ medication: 'Test' }),
      });
      expect(res.status).toBe(404);
    });
  });
});
