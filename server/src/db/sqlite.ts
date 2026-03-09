import { Database } from 'bun:sqlite';
import { resolve } from 'path';

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    const dbPath = resolve(process.cwd(), 'data', 'healthdiary.db');
    db = new Database(dbPath);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
