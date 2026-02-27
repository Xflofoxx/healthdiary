# SERV-005: DuckDB Analytics Setup

> **Requirement**: SERV-005  
> **Component**: Server  
> **Status**: Implementation Ready

## Description

The server must use DuckDB for analytics and time-series data storage, enabling trend analysis and reporting.

## Database File

- Location: `data/analytics.duckdb`
- Created automatically on first run

## Schema

### Illness History Table

```sql
CREATE TABLE IF NOT EXISTS illness_history (
  illness_id TEXT,
  name TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  duration_days INTEGER,
_at TIM  recordedESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_illness_history_id ON illness_history(illness_id);
CREATE INDEX IF NOT EXISTS idx_illness_history_start ON illness_history(start_date);
```

### Prescription History Table

```sql
CREATE TABLE IF NOT EXISTS prescription_history (
  prescription_id TEXT,
  medication TEXT,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  illness_id TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prescription_history_id ON prescription_history(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_history_medication ON prescription_history(medication);
```

### Appointment History Table

```sql
CREATE TABLE IF NOT EXISTS appointment_history (
  appointment_id TEXT,
  doctor_name TEXT,
  specialty TEXT,
  date DATE,
  time TEXT,
  location TEXT,
  illness_id TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointment_history_id ON appointment_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_history_date ON appointment_history(date);
```

## Analytics Queries

### Illness Duration Statistics

```sql
SELECT 
  name,
  AVG(duration_days) as avg_duration,
  COUNT(*) as total_occurrences,
  MAX(duration_days) as max_duration,
  MIN(duration_days) as min_duration
FROM illness_history
GROUP BY name
ORDER BY total_occurrences DESC;
```

### Doctor Visit Frequency

```sql
SELECT 
  doctor_name,
  specialty,
  COUNT(*) as visit_count,
  COUNT(DISTINCT date) as unique_days
FROM appointment_history
GROUP BY doctor_name, specialty
ORDER BY visit_count DESC;
```

## Implementation

- File: `db/duckdb.ts`
- Use DuckDB Node.js API
- Auto-create database and tables on startup
- Sync data from SQLite on create/update/delete operations
- Support analytics queries

## Data Sync Strategy

1. On illness/prescription/appointment create: Insert to DuckDB
2. On illness/prescription/appointment update: Insert updated record to DuckDB
3. On illness/prescription/appointment delete: Mark as deleted in DuckDB (soft delete)
