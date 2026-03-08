import { getDb } from "./sqlite";
import { getDuckDb } from "./duckdb";
import { mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";

export function runMigrations(): void {
  const dataDir = resolve(process.cwd(), "data");
  
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  console.log("Running SQLite migrations...");
  runSqliteMigrations();
  
  console.log("Running DuckDB migrations...");
  runDuckDbMigrations();
  
  console.log("Migrations complete!");
}

function runSqliteMigrations(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS illnesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      notes TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_illnesses_status ON illnesses(status);
    CREATE INDEX IF NOT EXISTS idx_illnesses_start_date ON illnesses(start_date);

    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      medication TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      notes TEXT,
      illness_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (illness_id) REFERENCES illnesses(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_prescriptions_illness ON prescriptions(illness_id);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_start_date ON prescriptions(start_date);

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      doctor_name TEXT NOT NULL,
      specialty TEXT,
      date TEXT NOT NULL,
      time TEXT,
      location TEXT,
      notes TEXT,
      illness_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (illness_id) REFERENCES illnesses(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_appointments_illness ON appointments(illness_id);

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      credential_id TEXT NOT NULL,
      public_key TEXT NOT NULL,
      counter INTEGER DEFAULT 0,
      device_type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS temp_challenges (
      id TEXT PRIMARY KEY,
      challenge TEXT NOT NULL,
      user_data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function runDuckDbMigrations(): void {
  const db = getDuckDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS illness_history (
      illness_id TEXT,
      name TEXT,
      start_date DATE,
      end_date DATE,
      status TEXT,
      duration_days INTEGER,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS prescription_history (
      prescription_id TEXT,
      medication TEXT,
      dosage TEXT,
      frequency TEXT,
      start_date DATE,
      end_date DATE,
      illness_id TEXT,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointment_history (
      appointment_id TEXT,
      doctor_name TEXT,
      specialty TEXT,
      date DATE,
      time TEXT,
      location TEXT,
      illness_id TEXT,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

if (import.meta.main) {
  runMigrations();
}
