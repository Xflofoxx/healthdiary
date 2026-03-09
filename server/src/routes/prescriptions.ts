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
  const { search, illnessId, active } = c.req.query();

  let sql = `
    SELECT p.*, i.name as illness_name 
    FROM prescriptions p 
    LEFT JOIN illnesses i ON p.illness_id = i.id
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

  if (active === 'true') {
    conditions.push("(p.end_date IS NULL OR p.end_date >= date('now'))");
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY p.start_date DESC';

  const rows = db.prepare(sql).all(...params) as (Prescription & { illness_name: string })[];

  const prescriptions = rows.map((row) => ({
    id: row.id,
    medication: row.medication,
    dosage: row.dosage,
    frequency: row.frequency,
    startDate: row.startDate,
    endDate: row.endDate,
    notes: row.notes,
    illnessId: row.illnessId,
    illnessName: row.illness_name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return c.json({ prescriptions, total: prescriptions.length });
});

prescriptionsRouter.get('/:id', (c) => {
  const id = c.req.param('id');
  const db = getDb();

  const row = db
    .prepare(`
    SELECT p.*, i.name as illness_name 
    FROM prescriptions p 
    LEFT JOIN illnesses i ON p.illness_id = i.id
    WHERE p.id = ?
  `)
    .get(id) as (Prescription & { illness_name: string }) | undefined;

  if (!row) {
    return c.json({ error: 'Prescription not found' }, 404);
  }

  return c.json({
    id: row.id,
    medication: row.medication,
    dosage: row.dosage,
    frequency: row.frequency,
    startDate: row.startDate,
    endDate: row.endDate,
    notes: row.notes,
    illnessId: row.illnessId,
    illnessName: row.illness_name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
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

  const id = uuid();
  const now = new Date().toISOString();

  const db = getDb();

  db.prepare(`
    INSERT INTO prescriptions (id, medication, dosage, frequency, start_date, end_date, notes, illness_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.medication,
    body.dosage || null,
    body.frequency || null,
    body.startDate,
    body.endDate || null,
    body.notes || null,
    body.illnessId || null,
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

  if (body.illnessId) {
    const illness = db.prepare('SELECT id FROM illnesses WHERE id = ?').get(body.illnessId);
    if (!illness) {
      return c.json({ error: 'Illness not found' }, 400);
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

  db.prepare(`
    UPDATE prescriptions 
    SET medication = ?, dosage = ?, frequency = ?, start_date = ?, end_date = ?, notes = ?, illness_id = ?, updated_at = ?
    WHERE id = ?
  `).run(medication, dosage, frequency, startDate, endDate, notes, illnessId, now, id);

  const prescription = {
    id,
    medication,
    dosage,
    frequency,
    startDate,
    endDate,
    notes,
    illnessId,
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
