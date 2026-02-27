import DuckDB from "duckdb";
import { resolve } from "path";

let db: DuckDB.Database | null = null;

export function getDuckDb(): DuckDB.Database {
  if (!db) {
    const dbPath = resolve(process.cwd(), "data", "analytics.duckdb");
    db = new DuckDB.Database(dbPath);
  }
  return db;
}

export function closeDuckDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function queryDuckDb(sql: string, params?: unknown[]): DuckDB.Row[] {
  const database = getDuckDb();
  const stmt = database.prepare(sql);
  return params ? stmt.all(...params) : stmt.all();
}
