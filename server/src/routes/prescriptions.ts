import { Hono } from 'hono';
import { v4 as uuid } from 'uuid';
import { queryDuckDb } from '../db/duckdb';
import { getDb } from '../db/sqlite';
import { requireAuth } from '../middleware/auth';
import type { Prescription, PrescriptionInput } from '../models/prescription';

const prescriptionsRouter = new Hono();

prescriptionsRouter.use('*', requireAuth);

prescriptionsRouter.get('/', (c) => {
  const db = getDb();
  const { search, illnessId, active, doctorId } = c.req.query();

  let sql = `
    SELECT p.*, i.name as illness_name, d.name as doctor_name, d.specialty as doctor_specialty
    FROM prescriptions p 
    LEFT JOIN illnesses i ON p.illness_id = i.id
    LEFT JOIN doctors d ON p.doctor_id = d.id
  `;
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (search) {
    conditions.push('p.medication LIKE ?');
    params.push(`%${search}%`);
  }

  if (illnessId) {
    conditions.push('p.illness_id = ?');
    params.push(illnessId);
  }

  if (doctorId) {
    conditions.push('p.doctor_id = ?');
    params.push(doctorId);
  }

  if (active === 'true') {
    conditions.push("(p.end_date IS NULL OR p.end_date >= date('now'))");
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY p.start_date DESC';

  const rows = db.prepare(sql).all(...params) as (Prescription & {
    illness_name: string;
    doctor_name: string;
    doctor_specialty: string;
  })[];

  const prescriptions = rows.map((row: any) => ({
    id: row.id,
    medication: row.medication,
    dosage: row.dosage,
    frequency: row.frequency,
    startDate: row.start_date,
    endDate: row.end_date,
    notes: row.notes,
    illnessId: row.illness_id,
    illnessName: row.illness_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSpecialty: row.doctor_specialty,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return c.json({ prescriptions, total: prescriptions.length });
});

prescriptionsRouter.get('/:id', (c) => {
  const id = c.req.param('id');
  const db = getDb();

  const row = db
    .prepare(`
    SELECT p.*, i.name as illness_name, d.name as doctor_name, d.specialty as doctor_specialty
    FROM prescriptions p 
    LEFT JOIN illnesses i ON p.illness_id = i.id
    LEFT JOIN doctors d ON p.doctor_id = d.id
    WHERE p.id = ?
  `)
    .get(id) as
    | (Prescription & { illness_name: string; doctor_name: string; doctor_specialty: string })
    | undefined;

  if (!row) {
    return c.json({ error: 'Prescription not found' }, 404);
  }

  return c.json({
    id: row.id,
    medication: row.medication,
    dosage: row.dosage,
    frequency: row.frequency,
    startDate: row.start_date,
    endDate: row.end_date,
    notes: row.notes,
    illnessId: row.illness_id,
    illnessName: row.illness_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSpecialty: row.doctor_specialty,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
});

prescriptionsRouter.post('/', async (c) => {
  const body = (await c.req.json()) as PrescriptionInput;

  if (!body.medication || !body.startDate) {
    return c.json({ error: 'Medication and startDate are required' }, 400);
  }

  if (body.illnessId) {
    const db = getDb();
    const illness = db.prepare('SELECT id FROM illnesses WHERE id = ?').get(body.illnessId);
    if (!illness) {
      return c.json({ error: 'Illness not found' }, 400);
    }
  }

  if (body.doctorId) {
    const db = getDb();
    const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(body.doctorId);
    if (!doctor) {
      return c.json({ error: 'Doctor not found' }, 400);
    }
  }

  const id = uuid();
  const now = new Date().toISOString();

  const db = getDb();

  db.prepare(`
    INSERT INTO prescriptions (id, medication, dosage, frequency, start_date, end_date, notes, illness_id, doctor_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.medication,
    body.dosage || null,
    body.frequency || null,
    body.startDate,
    body.endDate || null,
    body.notes || null,
    body.illnessId || null,
    body.doctorId || null,
    now,
    now
  );

  const prescription = {
    id,
    medication: body.medication,
    dosage: body.dosage || null,
    frequency: body.frequency || null,
    startDate: body.startDate,
    endDate: body.endDate || null,
    notes: body.notes || null,
    illnessId: body.illnessId || null,
    doctorId: body.doctorId || null,
    createdAt: now,
    updatedAt: now,
  };

  syncToDuckDb(prescription);

  return c.json(prescription, 201);
});

prescriptionsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = (await c.req.json()) as Partial<PrescriptionInput>;

  const db = getDb();
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
  if (!existing) {
    return c.json({ error: 'Prescription not found' }, 404);
  }

  if (body.illnessId !== undefined && body.illnessId !== null) {
    const illness = db.prepare('SELECT id FROM illnesses WHERE id = ?').get(body.illnessId);
    if (!illness) {
      return c.json({ error: 'Illness not found' }, 400);
    }
  }

  if (body.doctorId !== undefined && body.doctorId !== null) {
    const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(body.doctorId);
    if (!doctor) {
      return c.json({ error: 'Doctor not found' }, 400);
    }
  }

  const medication = body.medication ?? (existing as Prescription).medication;
  const dosage = body.dosage !== undefined ? body.dosage : (existing as Prescription).dosage;
  const frequency =
    body.frequency !== undefined ? body.frequency : (existing as Prescription).frequency;
  const startDate = body.startDate ?? (existing as Prescription).startDate;
  const endDate = body.endDate !== undefined ? body.endDate : (existing as Prescription).endDate;
  const notes = body.notes !== undefined ? body.notes : (existing as Prescription).notes;
  const illnessId =
    body.illnessId !== undefined ? body.illnessId : (existing as Prescription).illnessId;
  const doctorId =
    body.doctorId !== undefined ? body.doctorId : (existing as Prescription).doctorId;

  db.prepare(`
    UPDATE prescriptions 
    SET medication = ?, dosage = ?, frequency = ?, start_date = ?, end_date = ?, notes = ?, illness_id = ?, doctor_id = ?, updated_at = ?
    WHERE id = ?
  `).run(medication, dosage, frequency, startDate, endDate, notes, illnessId, doctorId, now, id);

  const prescription = {
    id,
    medication,
    dosage,
    frequency,
    startDate,
    endDate,
    notes,
    illnessId,
    doctorId,
    createdAt: (existing as Prescription).createdAt,
    updatedAt: now,
  };

  syncToDuckDb(prescription);

  return c.json(prescription);
});

prescriptionsRouter.delete('/:id', (c) => {
  const id = c.req.param('id');
  const db = getDb();

  const existing = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
  if (!existing) {
    return c.json({ error: 'Prescription not found' }, 404);
  }

  db.prepare('DELETE FROM prescriptions WHERE id = ?').run(id);

  return c.json({ message: 'Prescription deleted' });
});

function syncToDuckDb(prescription: Prescription): void {
  queryDuckDb(`INSERT INTO prescription_history VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`, [
    prescription.id,
    prescription.medication,
    prescription.dosage,
    prescription.frequency,
    prescription.startDate,
    prescription.endDate,
    prescription.illnessId,
  ]);
}

export default prescriptionsRouter;
