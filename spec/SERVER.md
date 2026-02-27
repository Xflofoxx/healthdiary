# Server Specification

> **Version**: 1.0.0  
> **Component**: Server  
> **Related Requirements**: SERV-001 through SERV-006  
> **Status**: Implementation Ready

## 1. Overview

The Healthdiary Server provides REST APIs for managing illnesses, prescriptions, and doctor appointments. Built with Bun.js and Hono for maximum performance.

## 2. Technical Stack

| Component | Technology | Version | Justification |
|-----------|------------|---------|----------------|
| Runtime | Bun.js | 1.1+ | High performance, native TypeScript |
| Framework | Hono | 4.0+ | Lightweight, fast, Cloudflare compatible |
| Persistent DB | SQLite (better-sqlite3) | 11.0+ | ACID compliance for entity data |
| Analytics DB | DuckDB | 1.0+ | OLAP for time-series analytics |
| Language | TypeScript | 5.0+ | Type safety |

## 3. Architecture

### 3.1 Directory Structure

```
server/src/
├── index.ts              # Entry point & app setup
├── routes/
│   ├── illnesses.ts      # Illness CRUD operations
│   ├── prescriptions.ts  # Prescription CRUD operations
│   └── appointments.ts   # Appointment CRUD operations
├── services/
│   ├── illness.ts        # Illness business logic
│   ├── prescription.ts   # Prescription business logic
│   └── appointment.ts    # Appointment business logic
├── db/
│   ├── sqlite.ts         # SQLite connection
│   ├── duckdb.ts         # DuckDB connection
│   └── migrate.ts        # Database migrations
└── utils/
    └── logger.ts         # Logging utility
```

## 4. API Specification

### 4.1 Endpoints

#### Illnesses

| Method | Path | Requirement | Description |
|--------|------|-------------|-------------|
| GET | /api/v1/illnesses | SERV-001 | List all illnesses |
| GET | /api/v1/illnesses/:id | SERV-001 | Get illness details |
| POST | /api/v1/illnesses | SERV-001 | Create new illness |
| PUT | /api/v1/illnesses/:id | SERV-001 | Update illness |
| DELETE | /api/v1/illnesses/:id | SERV-001 | Delete illness |

#### Prescriptions

| Method | Path | Requirement | Description |
|--------|------|-------------|-------------|
| GET | /api/v1/prescriptions | SERV-002 | List all prescriptions |
| GET | /api/v1/prescriptions/:id | SERV-002 | Get prescription details |
| POST | /api/v1/prescriptions | SERV-002 | Create new prescription |
| PUT | /api/v1/prescriptions/:id | SERV-002 | Update prescription |
| DELETE | /api/v1/prescriptions/:id | SERV-002 | Delete prescription |

#### Appointments

| Method | Path | Requirement | Description |
|--------|------|-------------|-------------|
| GET | /api/v1/appointments | SERV-003 | List all appointments |
| GET | /api/v1/appointments/:id | SERV-003 | Get appointment details |
| POST | /api/v1/appointments | SERV-003 | Create new appointment |
| PUT | /api/v1/appointments/:id | SERV-003 | Update appointment |
| DELETE | /api/v1/appointments/:id | SERV-003 | Delete appointment |

#### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |

### 4.2 Request/Response Formats

#### Illness (POST /api/v1/illnesses)

```json
{
  "name": "Flu",
  "notes": "Had fever and body aches",
  "startDate": "2026-01-15",
  "endDate": "2026-01-22",
  "status": "resolved"
}
```

#### Prescription (POST /api/v1/prescriptions)

```json
{
  "medication": "Amoxicillin",
  "dosage": "500mg",
  "frequency": "3 times daily",
  "startDate": "2026-01-15",
  "endDate": "2026-01-22",
  "notes": "Take with food",
  "illnessId": "ill-001"
}
```

#### Appointment (POST /api/v1/appointments)

```json
{
  "doctorName": "Dr. Smith",
  "specialty": "General Practitioner",
  "date": "2026-02-15",
  "time": "10:30",
  "location": "123 Medical Center",
  "notes": "Annual checkup",
  "illnessId": "ill-001"
}
```

## 5. Database Schema

### 5.1 SQLite (healthdiary.db)

```sql
-- Illnesses table
CREATE TABLE illnesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  notes TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE prescriptions (
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
  FOREIGN KEY (illness_id) REFERENCES illnesses(id)
);

-- Appointments table
CREATE TABLE appointments (
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
  FOREIGN KEY (illness_id) REFERENCES illnesses(id)
);

-- Indexes
CREATE INDEX idx_illnesses_status ON illnesses(status);
CREATE INDEX idx_prescriptions_illness ON prescriptions(illness_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_illness ON appointments(illness_id);
```

### 5.2 DuckDB (analytics.duckdb)

```sql
-- Illness analytics
CREATE TABLE illness_history (
  illness_id TEXT,
  name TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  duration_days INTEGER
);

-- Prescription analytics
CREATE TABLE prescription_history (
  prescription_id TEXT,
  medication TEXT,
  start_date DATE,
  end_date DATE,
  illness_id TEXT
);

-- Appointment analytics
CREATE TABLE appointment_history (
  appointment_id TEXT,
  doctor_name TEXT,
  specialty TEXT,
  date DATE,
  time TEXT,
  illness_id TEXT
);

-- Indexes
CREATE INDEX idx_illness_history_id ON illness_history(illness_id);
CREATE INDEX idx_prescription_history_id ON prescription_history(prescription_id);
CREATE INDEX idx_appointment_history_id ON appointment_history(appointment_id);
```

## 6. Performance Targets

| Metric | Target | Verification Method |
|--------|--------|---------------------|
| Server startup | < 500ms | Benchmark |
| API latency (p50) | < 50ms | Load test |
| CRUD throughput | 1000+ ops/sec | Load test |
| Memory footprint | < 100MB | Resource monitor |

## 7. Development Commands

```bash
# Install dependencies
bun install

# Run migrations
bun run migrate

# Development mode
bun run dev

# Production
bun run start

# Run tests
bun test

# Run tests with coverage
bun test --coverage

# Lint
bun run lint
```

## 8. Implementation Checklist

### Pre-Implementation Gates

- [x] Simplicity Gate: Using ≤3 projects? (server, client)
- [x] Anti-Abstraction Gate: Using framework directly (Hono)?
- [x] Integration-First Gate: Contracts defined?

### Requirement Traceability

- [ ] SERV-001: REST API for illness CRUD → routes/illnesses.ts
- [ ] SERV-002: REST API for prescription CRUD → routes/prescriptions.ts
- [ ] SERV-003: REST API for appointment CRUD → routes/appointments.ts
- [ ] SERV-004: SQLite database setup → db/sqlite.ts
- [ ] SERV-005: DuckDB analytics setup → db/duckdb.ts
- [ ] SERV-006: Health check endpoint → GET /health

## 9. Cross-References

| Reference | File | Description |
|-----------|------|-------------|
| CONTEXT.md | spec/CONTEXT.md | Development constitution |
| ROADMAP.md | spec/ROADMAP.md | Version roadmap |
| CODING_STYLE.md | spec/CODING_STYLE.md | Coding standards |
| WORKFLOW.md | spec/WORKFLOW.md | Git workflow |
| TESTS.md | spec/TESTS.md | Test strategy |
