# Healthdiary

<p align="center">
  <img src="https://img.shields.io/badge/HealthDiary-v1.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Stack-Bun.js%2FSQLite%2FDuckDB%2FAngular-orange?style=for-the-badge" alt="Stack">
  <img src="https://img.shields.io/github/license/Xflofoxx/healthdiary?style=for-the-badge" alt="License">
</p>

A personal health diary application for tracking illnesses, prescriptions, and doctor appointments. Built with modern technologies for performance and reliability.

## Features

### Core Features

- **Illness Tracking** - Record and monitor illnesses with start/end dates, notes, and status (active/resolved/chronic)
- **Prescription Management** - Track medications, dosages, frequencies, and link them to illnesses
- **Doctor Appointments** - Schedule and manage medical appointments with list view
- **Analytics** - DuckDB-powered analytics for health trends and statistics

### Technical Features

- RESTful API built with Bun.js and Hono
- SQLite for persistent data storage (via bun:sqlite)
- DuckDB for time-series analytics
- Angular 19+ standalone components with new control flow (@if, @for)
- Lazy loading for routes
- GitHub Pages documentation

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun.js 1.1+ |
| Framework | Hono 4.0+ |
| SQLite | bun:sqlite |
| Analytics DB | DuckDB |
| Language | TypeScript 5.6+ |
| Frontend | Angular 19+ |

## Quick Start

### Prerequisites

- Bun.js 1.1+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Xflofoxx/healthdiary.git
cd healthdiary

# Install dependencies for server and client
cd server && bun install && cd ..
cd client && bun install && cd ..
```

### Running the Application

#### Option 1: Using the startup script

```bash
# On Windows
bin\start.bat

# On Linux/Mac
bun bin/start
```

#### Option 2: Manual startup

```bash
# Terminal 1: Start the server
cd server
bun run migrate  # Only first time
bun run dev

# Terminal 2: Start the client
cd client
bun start
```

The server will be available at `http://localhost:3000` and the client at `http://localhost:4200`.

## API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Endpoints

#### Illnesses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /illnesses | List all illnesses |
| GET | /illnesses/:id | Get illness by ID |
| POST | /illnesses | Create new illness |
| PUT | /illnesses/:id | Update illness |
| DELETE | /illnesses/:id | Delete illness |

**Query Parameters:**
- `search` - Search by name
- `status` - Filter by status (active/resolved/chronic)

#### Prescriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /prescriptions | List all prescriptions |
| GET | /prescriptions/:id | Get prescription by ID |
| POST | /prescriptions | Create new prescription |
| PUT | /prescriptions/:id | Update prescription |
| DELETE | /prescriptions/:id | Delete prescription |

**Query Parameters:**
- `search` - Search by medication name
- `illnessId` - Filter by illness
- `active` - Filter active prescriptions

#### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /appointments | List all appointments |
| GET | /appointments/:id | Get appointment by ID |
| POST | /appointments | Create new appointment |
| PUT | /appointments/:id | Update appointment |
| DELETE | /appointments/:id | Delete appointment |

**Query Parameters:**
- `illnessId` - Filter by illness
- `dateFrom` - Filter from date
- `dateTo` - Filter to date
- `specialty` - Filter by specialty

#### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check with service status |

## Project Structure

```
healthdiary/
├── bin/                     # Startup scripts
│   ├── start               # Bun script (Unix)
│   └── start.bat           # Windows batch script
├── docs/                   # GitHub Pages documentation
├── spec/                   # Project specifications
│   ├── server/             # Server requirements (SERV-001 to SERV-006)
│   ├── client/             # Client requirements (CLIENT-001 to CLIENT-005)
│   ├── CONTEXT.md          # Development constitution
│   ├── ROADMAP.md          # Version roadmap
│   ├── WORKFLOW.md         # Git workflow
│   ├── CODING_STYLE.md     # Coding standards
│   ├── TESTS.md            # Test strategy
│   └── SERVER.md           # Server architecture
├── server/                 # Bun.js server
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── routes/         # API routes
│   │   │   ├── illnesses.ts
│   │   │   ├── prescriptions.ts
│   │   │   ├── appointments.ts
│   │   │   └── health.ts
│   │   ├── models/         # Data models
│   │   ├── db/             # Database connections
│   │   │   ├── sqlite.ts
│   │   │   ├── duckdb.ts
│   │   │   └── migrate.ts
│   │   ├── middleware/     # Express-like middleware
│   │   └── utils/          # Utilities
│   └── package.json
└── client/                # Angular client
    ├── src/
    │   ├── app/
    │   │   ├── components/ # UI components
    │   │   │   ├── illness-list/
    │   │   │   ├── illness-form/
    │   │   │   ├── prescription-list/
    │   │   │   ├── prescription-form/
    │   │   │   ├── appointment-list/
    │   │   │   └── appointment-form/
    │   │   ├── services/   # API services
    │   │   └── models/     # TypeScript interfaces
    │   └── styles.css
    └── package.json
```

## Development

### Running Tests

```bash
# Server tests
cd server && bun test

# With coverage
cd server && bun test --coverage
```

### Database Migrations

```bash
cd server && bun run migrate
```

### Code Quality

```bash
# Lint (server)
cd server && bun run lint

# Format (server)
cd server && bun run format
```

## Contributing

1. Create a feature branch: `git checkout -b feat/xxx-description`
2. Follow the [Workflow Specification](spec/WORKFLOW.md)
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

ISC License - see LICENSE file for details

## Author

Dario Olivini <xflofoxx@gmail.com>

---

<p align="center">
  Built with ❤️ using Bun.js, SQLite, DuckDB, and Angular
</p>
