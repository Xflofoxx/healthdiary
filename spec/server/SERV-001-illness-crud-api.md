# SERV-001: Illness CRUD REST API

> **Requirement**: SERV-001  
> **Component**: Server  
> **Status**: Implementation Ready

## Description

The server must provide REST API endpoints for Create, Read, Update, and Delete operations on illness records.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/illnesses | List all illnesses |
| GET | /api/v1/illnesses/:id | Get illness by ID |
| POST | /api/v1/illnesses | Create new illness |
| PUT | /api/v1/illnesses/:id | Update illness |
| DELETE | /api/v1/illnesses/:id | Delete illness |

## Request/Response Formats

### GET /api/v1/illnesses

Response:
```json
{
  "illnesses": [
    {
      "id": "ill-001",
      "name": "Flu",
      "notes": "Had fever and body aches",
      "startDate": "2026-01-15",
      "endDate": "2026-01-22",
      "status": "resolved",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-22T14:00:00Z"
    }
  ],
  "total": 1
}
```

### POST /api/v1/illnesses

Request:
```json
{
  "name": "Flu",
  "notes": "Had fever and body aches",
  "startDate": "2026-01-15",
  "endDate": "2026-01-22",
  "status": "resolved"
}
```

Response: 201 Created
```json
{
  "id": "ill-001",
  "name": "Flu",
  "notes": "Had fever and body aches",
  "startDate": "2026-01-15",
  "endDate": "2026-01-22",
  "status": "resolved",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

## Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| name | Yes | string | 1-200 characters |
| notes | No | string | Max 5000 characters |
| startDate | Yes | string | ISO 8601 date |
| endDate | No | string | ISO 8601 date, must be >= startDate |
| status | No | string | Enum: "active", "resolved", "chronic", default: "active" |

## Response Codes

- 200: Success
- 201: Created
- 400: Validation error
- 404: Not found
- 500: Internal server error

## Implementation

- File: `routes/illnesses.ts`
- Validate input data
- Generate UUID for new records
- Store in SQLite
- Sync to DuckDB for analytics
