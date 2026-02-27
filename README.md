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
- **Doctor Appointments** - Schedule and manage medical appointments with calendar view
- **Analytics Dashboard** - DuckDB-powered analytics for health trends and statistics

### Technical Features

- RESTful API built with Bun.js and Hono
- SQLite for persistent data storage
- DuckDB for time-series analytics
- Angular 19+ standalone components
- Comprehensive test coverage
- GitHub Pages documentation

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun.js 1.1+ |
| Framework | Hono 4.0+ |
| Persistent DB | SQLite (better-sqlite3) |
| Analytics DB | DuckDB |
| Language | TypeScript |
| Frontend | Angular 19+ |

## Quick Start

### Prerequisites

- Bun.js 1.1+
- Node.js 18+ (for Angular CLI)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Xflofoxx/healthdiary.git
cd healthdiary

# Install server dependencies
bun install

# Install client dependencies
cd client && bun install && cd ..
```

### Running the Application

```bash
# Run migrations (first time only)
bun run migrate

# Start the server
bun run dev

# In another terminal, start the client
cd client && bun start
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

#### Prescriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /prescriptions | List all prescriptions |
| GET | /prescriptions/:id | Get prescription by ID |
| POST | /prescriptions | Create new prescription |
| PUT | /prescriptions/:id | Update prescription |
| DELETE | /prescriptions/:id | Delete prescription |

#### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /appointments | List all appointments |
| GET | /appointments/:id | Get appointment by ID |
| POST | /appointments | Create new appointment |
| PUT | /appointments/:id | Update appointment |
| DELETE | /appointments/:id | Delete appointment |

#### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |

## Project Structure

```
healthdiary/
├── docs/                  # GitHub Pages documentation
├── spec/                 # Project specifications
│   ├── server/           # Server requirements
│   ├── client/           # Client requirements
│   ├── CONTEXT.md       # Development constitution
│   ├── ROADMAP.md       # Version roadmap
│   └── ...
├── server/               # Bun.js server
│   └── src/
│       ├── routes/      # API routes
│       ├── services/    # Business logic
│       ├── db/          # Database connections
│       └── utils/       # Utilities
└── client/              # Angular client
    └── src/
        ├── app/
        │   ├── components/
        │   ├── services/
        │   └── models/
        └── styles.css
```

## Development

### Running Tests

```bash
# Server tests
bun test

# With coverage
bun test --coverage
```

### Code Quality

```bash
# Lint
bun run lint

# Format
bun run format
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
