# SERV-004: SQLite Database Setup

> **Requirement**: SERV-004  
> **Component**: Server  
> **Status**: Implementation Ready

## Description

The server must use SQLite for persistent storage of all health diary entities (illnesses, prescriptions, appointments).

## Database File

- Location: `data/healthdiary.db`
- Created automatically on first run

## Schema

### Illnesses Table

```sql
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
```

### Prescriptions Table

```sql
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
```

### Appointments Table

```sql
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
```

## Implementation

- File: `db/sqlite.ts`
- Use `better-sqlite3` for synchronous SQLite access
- Implement connection pooling
- Auto-create database and tables on startup
- Handle migrations

## Migrations

Migrations stored in `db/migrations/`:

```sql
-- 001_initial.sql
-- Creates all tables and indexes
```

Run migrations:
```bash
bun run migrate
```
