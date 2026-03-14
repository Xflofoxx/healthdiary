import { Hono } from 'hono';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/sqlite';
import { requireAuth } from '../middleware/auth';
import type { Doctor, DoctorInput } from '../models/doctor';

const doctorsRouter = new Hono();

doctorsRouter.use('*', requireAuth);

doctorsRouter.get('/', (c) => {
  const db = getDb();
  const { search } = c.req.query();

  let sql = 'SELECT * FROM doctors';
  const params: unknown[] = [];

  if (search) {
    sql += ' WHERE name LIKE ? OR specialty LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY name ASC';

  const rows = db.prepare(sql).all(...params) as Doctor[];

  const doctors = rows.map((row) => ({
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    phone: row.phone,
    email: row.email,
    address: row.address,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return c.json({ doctors, total: doctors.length });
});

doctorsRouter.get('/:id', (c) => {
  const id = c.req.param('id');
  const db = getDb();

  const row = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id) as Doctor | undefined;

  if (!row) {
    return c.json({ error: 'Doctor not found' }, 404);
  }

  return c.json({
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    phone: row.phone,
    email: row.email,
    address: row.address,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
});

doctorsRouter.post('/', async (c) => {
  const body = (await c.req.json()) as DoctorInput;

  if (!body.name) {
    return c.json({ error: 'Name is required' }, 400);
  }

  const id = uuid();
  const now = new Date().toISOString();

  const db = getDb();

  db.prepare(`
    INSERT INTO doctors (id, name, specialty, phone, email, address, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.name,
    body.specialty || null,
    body.phone || null,
    body.email || null,
    body.address || null,
    body.notes || null,
    now,
    now
  );

  const doctor = {
    id,
    name: body.name,
    specialty: body.specialty || null,
    phone: body.phone || null,
    email: body.email || null,
    address: body.address || null,
    notes: body.notes || null,
    createdAt: now,
    updatedAt: now,
  };

  return c.json(doctor, 201);
});

doctorsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = (await c.req.json()) as Partial<DoctorInput>;

  const db = getDb();
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
  if (!existing) {
    return c.json({ error: 'Doctor not found' }, 404);
  }

  const name = body.name ?? (existing as Doctor).name;
  const specialty = body.specialty !== undefined ? body.specialty : (existing as Doctor).specialty;
  const phone = body.phone !== undefined ? body.phone : (existing as Doctor).phone;
  const email = body.email !== undefined ? body.email : (existing as Doctor).email;
  const address = body.address !== undefined ? body.address : (existing as Doctor).address;
  const notes = body.notes !== undefined ? body.notes : (existing as Doctor).notes;

  db.prepare(`
    UPDATE doctors 
    SET name = ?, specialty = ?, phone = ?, email = ?, address = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `).run(name, specialty, phone, email, address, notes, now, id);

  const doctor = {
    id,
    name,
    specialty,
    phone,
    email,
    address,
    notes,
    createdAt: (existing as Doctor).createdAt,
    updatedAt: now,
  };

  return c.json(doctor);
});

doctorsRouter.delete('/:id', (c) => {
  const id = c.req.param('id');
  const db = getDb();

  const existing = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
  if (!existing) {
    return c.json({ error: 'Doctor not found' }, 404);
  }

  db.prepare('DELETE FROM doctors WHERE id = ?').run(id);

  return c.json({ message: 'Doctor deleted' });
});

export default doctorsRouter;
