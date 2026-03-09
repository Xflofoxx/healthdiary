import { Hono } from 'hono';
import { v4 as uuid } from 'uuid';
import { queryDuckDb } from '../db/duckdb';
import { getDb } from '../db/sqlite';
import { requireAuth } from '../middleware/auth';
import type { Appointment, AppointmentInput } from '../models/appointment';

const appointmentsRouter = new Hono();

appointmentsRouter.use('*', requireAuth);

appointmentsRouter.get('/', (c) => {
  const db = getDb();
  const { illnessId, dateFrom, dateTo, specialty } = c.req.query();

  let sql = `
    SELECT a.*, i.name as illness_name 
    FROM appointments a 
    LEFT JOIN illnesses i ON a.illness_id = i.id
  `;
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (illnessId) {
    conditions.push('a.illness_id = ?');
    params.push(illnessId);
  }

  if (dateFrom) {
    conditions.push('a.date >= ?');
    params.push(dateFrom);
  }

  if (dateTo) {
    conditions.push('a.date <= ?');
    params.push(dateTo);
  }

  if (specialty) {
    conditions.push('a.specialty = ?');
    params.push(specialty);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY a.date ASC, a.time ASC';

  const rows = db.prepare(sql).all(...params) as (Appointment & { illness_name: string })[];

  const appointments = rows.map((row) => ({
    id: row.id,
    doctorName: row.doctorName,
    specialty: row.specialty,
    date: row.date,
    time: row.time,
    location: row.location,
    notes: row.notes,
    illnessId: row.illnessId,
    illnessName: row.illness_name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return c.json({ appointments, total: appointments.length });
});

appointmentsRouter.get('/:id', (c) => {
  const id = c.req.param('id');
  const db = getDb();

  const row = db
    .prepare(`
    SELECT a.*, i.name as illness_name 
    FROM appointments a 
    LEFT JOIN illnesses i ON a.illness_id = i.id
    WHERE a.id = ?
  `)
    .get(id) as (Appointment & { illness_name: string }) | undefined;

  if (!row) {
    return c.json({ error: 'Appointment not found' }, 404);
  }

  return c.json({
    id: row.id,
    doctorName: row.doctorName,
    specialty: row.specialty,
    date: row.date,
    time: row.time,
    location: row.location,
    notes: row.notes,
    illnessId: row.illnessId,
    illnessName: row.illness_name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
});

appointmentsRouter.post('/', async (c) => {
  const body = (await c.req.json()) as AppointmentInput;

  if (!body.doctorName || !body.date) {
    return c.json({ error: 'DoctorName and date are required' }, 400);
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
    INSERT INTO appointments (id, doctor_name, specialty, date, time, location, notes, illness_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.doctorName,
    body.specialty || null,
    body.date,
    body.time || null,
    body.location || null,
    body.notes || null,
    body.illnessId || null,
    now,
    now
  );

  const appointment = {
    id,
    doctorName: body.doctorName,
    specialty: body.specialty || null,
    date: body.date,
    time: body.time || null,
    location: body.location || null,
    notes: body.notes || null,
    illnessId: body.illnessId || null,
    createdAt: now,
    updatedAt: now,
  };

  syncToDuckDb(appointment);

  return c.json(appointment, 201);
});

appointmentsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = (await c.req.json()) as Partial<AppointmentInput>;

  const db = getDb();
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  if (!existing) {
    return c.json({ error: 'Appointment not found' }, 404);
  }

  if (body.illnessId) {
    const illness = db.prepare('SELECT id FROM illnesses WHERE id = ?').get(body.illnessId);
    if (!illness) {
      return c.json({ error: 'Illness not found' }, 400);
    }
  }

  const doctorName = body.doctorName ?? (existing as Appointment).doctorName;
  const specialty =
    body.specialty !== undefined ? body.specialty : (existing as Appointment).specialty;
  const date = body.date ?? (existing as Appointment).date;
  const time = body.time !== undefined ? body.time : (existing as Appointment).time;
  const location = body.location !== undefined ? body.location : (existing as Appointment).location;
  const notes = body.notes !== undefined ? body.notes : (existing as Appointment).notes;
  const illnessId =
    body.illnessId !== undefined ? body.illnessId : (existing as Appointment).illnessId;

  db.prepare(`
    UPDATE appointments 
    SET doctor_name = ?, specialty = ?, date = ?, time = ?, location = ?, notes = ?, illness_id = ?, updated_at = ?
    WHERE id = ?
  `).run(doctorName, specialty, date, time, location, notes, illnessId, now, id);

  const appointment = {
    id,
    doctorName,
    specialty,
    date,
    time,
    location,
    notes,
    illnessId,
    createdAt: (existing as Appointment).createdAt,
    updatedAt: now,
  };

  syncToDuckDb(appointment);

  return c.json(appointment);
});

appointmentsRouter.delete('/:id', (c) => {
  const id = c.req.param('id');
  const db = getDb();

  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  if (!existing) {
    return c.json({ error: 'Appointment not found' }, 404);
  }

  db.prepare('DELETE FROM appointments WHERE id = ?').run(id);

  return c.json({ message: 'Appointment deleted' });
});

function syncToDuckDb(appointment: Appointment): void {
  queryDuckDb(`INSERT INTO appointment_history VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`, [
    appointment.id,
    appointment.doctorName,
    appointment.specialty,
    appointment.date,
    appointment.time,
    appointment.location,
    appointment.illnessId,
  ]);
}

export default appointmentsRouter;
