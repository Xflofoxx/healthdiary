import { Hono } from 'hono';
import { getDb } from '../db/sqlite';
import { requireAuth } from '../middleware/auth';

const dataRouter = new Hono();

interface ImportResult {
  illnesses: number;
  prescriptions: number;
  appointments: number;
  doctors: number;
  profile: boolean;
}

function importItems<T extends { id: string }>(
  db: ReturnType<typeof getDb>,
  table: string,
  items: T[] | undefined,
  insertSql: string
): number {
  if (!Array.isArray(items)) return 0;
  let count = 0;
  for (const item of items) {
    const existing = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(item.id);
    if (!existing) {
      const values = Object.values(item);
      db.prepare(insertSql).run(...values);
      count++;
    }
  }
  return count;
}

const INSERT_ILLNESS = `INSERT INTO illnesses (id, name, notes, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
const INSERT_PRESCRIPTION = `INSERT INTO prescriptions (id, medication, dosage, frequency, start_date, end_date, notes, illness_id, doctor_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const INSERT_APPOINTMENT = `INSERT INTO appointments (id, doctor_name, specialty, date, time, location, notes, illness_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const INSERT_DOCTOR = `INSERT INTO doctors (id, name, specialty, phone, email, address, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

dataRouter.get('/export', requireAuth, async (c) => {
  const userId = c.get('userId');
  const db = getDb();

  const illnesses = db.prepare('SELECT * FROM illnesses').all();
  const prescriptions = db.prepare('SELECT * FROM prescriptions').all();
  const appointments = db.prepare('SELECT * FROM appointments').all();
  const doctors = db.prepare('SELECT * FROM doctors').all();
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);

  const exportData = {
    version: '1.2.0',
    exportedAt: new Date().toISOString(),
    userId: userId,
    data: { illnesses, prescriptions, appointments, doctors, profile },
  };

  c.header('Content-Type', 'application/json');
  c.header(
    'Content-Disposition',
    `attachment; filename="healthdiary-export-${new Date().toISOString().split('T')[0]}.json"`
  );
  return c.json(exportData);
});

dataRouter.post('/import', requireAuth, async (c) => {
  const userId = c.get('userId');
  const db = getDb();

  let body: any;
  const contentType = c.req.header('Content-Type') || '';

  if (contentType.includes('application/json')) {
    body = await c.req.json();
  } else {
    const text = await c.req.text();
    body = JSON.parse(text);
  }

  if (!body.data) {
    return c.json({ error: 'Invalid import format' }, 400);
  }

  const { illnesses, prescriptions, appointments, doctors, profile } = body.data;
  const imported: ImportResult = {
    illnesses: 0,
    prescriptions: 0,
    appointments: 0,
    doctors: 0,
    profile: false,
  };

  imported.illnesses = importItems(db, 'illnesses', illnesses, INSERT_ILLNESS);
  imported.prescriptions = importItems(db, 'prescriptions', prescriptions, INSERT_PRESCRIPTION);
  imported.appointments = importItems(db, 'appointments', appointments, INSERT_APPOINTMENT);
  imported.doctors = importItems(db, 'doctors', doctors, INSERT_DOCTOR);

  if (profile) {
    const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(userId);
    const now = new Date().toISOString();

    if (existing) {
      db.prepare(
        `UPDATE user_profiles SET birth_date = ?, blood_type = ?, height = ?, weight = ?, allergies = ?, chronic_conditions = ?, emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relationship = ?, notes = ?, updated_at = ? WHERE user_id = ?`
      ).run(
        profile.birth_date,
        profile.blood_type,
        profile.height,
        profile.weight,
        profile.allergies,
        profile.chronic_conditions,
        profile.emergency_contact_name,
        profile.emergency_contact_phone,
        profile.emergency_contact_relationship,
        profile.notes,
        now,
        userId
      );
    } else {
      const { v4: uuidv4 } = await import('uuid');
      db.prepare(
        `INSERT INTO user_profiles (id, user_id, birth_date, blood_type, height, weight, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        uuidv4(),
        userId,
        profile.birth_date,
        profile.blood_type,
        profile.height,
        profile.weight,
        profile.allergies,
        profile.chronic_conditions,
        profile.emergency_contact_name,
        profile.emergency_contact_phone,
        profile.emergency_contact_relationship,
        profile.notes,
        now,
        now
      );
    }
    imported.profile = true;
  }

  return c.json({ success: true, imported });
});

export default dataRouter;
