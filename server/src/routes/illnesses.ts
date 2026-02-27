import { Hono } from "hono";
import { getDb } from "../db/sqlite";
import { queryDuckDb } from "../db/duckdb";
import { v4 as uuid } from "uuid";
import type { Illness, IllnessInput } from "../models/illness";

const illnessesRouter = new Hono();

illnessesRouter.get("/", (c) => {
  const db = getDb();
  const { search, status } = c.req.query();
  
  let sql = "SELECT * FROM illnesses";
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (search) {
    conditions.push("name LIKE ?");
    params.push(`%${search}%`);
  }

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY start_date DESC";

  const rows = db.prepare(sql).all(...params) as Illness[];
  
  const illnesses = rows.map((row) => ({
    id: row.id,
    name: row.name,
    notes: row.notes,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return c.json({ illnesses, total: illnesses.length });
});

illnessesRouter.get("/:id", (c) => {
  const id = c.req.param("id");
  const db = getDb();
  
  const row = db.prepare("SELECT * FROM illnesses WHERE id = ?").get(id) as Illness | undefined;
  
  if (!row) {
    return c.json({ error: "Illness not found" }, 404);
  }

  return c.json({
    id: row.id,
    name: row.name,
    notes: row.notes,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
});

illnessesRouter.post("/", async (c) => {
  const body = await c.req.json() as IllnessInput;
  
  if (!body.name || !body.startDate) {
    return c.json({ error: "Name and startDate are required" }, 400);
  }

  const id = uuid();
  const now = new Date().toISOString();
  const status = body.status || "active";

  const db = getDb();
  
  db.prepare(`
    INSERT INTO illnesses (id, name, notes, start_date, end_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.name, body.notes || null, body.startDate, body.endDate || null, status, now, now);

  const illness = {
    id,
    name: body.name,
    notes: body.notes || null,
    startDate: body.startDate,
    endDate: body.endDate || null,
    status,
    createdAt: now,
    updatedAt: now,
  };

  syncToDuckDb(illness);

  return c.json(illness, 201);
});

illnessesRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json() as Partial<IllnessInput>;
  
  const db = getDb();
  const now = new Date().toISOString();

  const existing = db.prepare("SELECT * FROM illnesses WHERE id = ?").get(id);
  if (!existing) {
    return c.json({ error: "Illness not found" }, 404);
  }

  const name = body.name ?? (existing as Illness).name;
  const notes = body.notes !== undefined ? body.notes : (existing as Illness).notes;
  const startDate = body.startDate ?? (existing as Illness).startDate;
  const endDate = body.endDate !== undefined ? body.endDate : (existing as Illness).endDate;
  const status = body.status ?? (existing as Illness).status;

  db.prepare(`
    UPDATE illnesses 
    SET name = ?, notes = ?, start_date = ?, end_date = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).run(name, notes, startDate, endDate, status, now, id);

  const illness = {
    id,
    name,
    notes,
    startDate,
    endDate,
    status,
    createdAt: (existing as Illness).createdAt,
    updatedAt: now,
  };

  syncToDuckDb(illness);

  return c.json(illness);
});

illnessesRouter.delete("/:id", (c) => {
  const id = c.req.param("id");
  const db = getDb();

  const existing = db.prepare("SELECT * FROM illnesses WHERE id = ?").get(id);
  if (!existing) {
    return c.json({ error: "Illness not found" }, 404);
  }

  db.prepare("DELETE FROM illnesses WHERE id = ?").run(id);

  return c.json({ message: "Illness deleted" });
});

function syncToDuckDb(illness: Illness): void {
  const startDate = new Date(illness.startDate);
  const endDate = illness.endDate ? new Date(illness.endDate) : null;
  const durationDays = endDate 
    ? Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  queryDuckDb(
    `INSERT INTO illness_history VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [illness.id, illness.name, illness.startDate, illness.endDate, illness.status, durationDays]
  );
}

export default illnessesRouter;
