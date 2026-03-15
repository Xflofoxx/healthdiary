# SERV-009: Symptom CRUD REST API

> **Requirement**: SERV-009  
> **Component**: Server  
> **Status**: Specification Ready

## Description

The server must provide REST API endpoints for tracking symptoms associated with illnesses.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/symptoms | List all symptoms |
| GET | /api/v1/symptoms/:id | Get symptom by ID |
| POST | /api/v1/symptoms | Create new symptom |
| PUT | /api/v1/symptoms/:id | Update symptom |
| DELETE | /api/v1/symptoms/:id | Delete symptom |

## Request/Response Formats

### GET /api/v1/symptoms

Response:
```json
{
  "symptoms": [
    {
      "id": "sym-001",
      "illnessId": "ill-001",
      "name": "Headache",
      "severity": 3,
      "notes": "Worse in the morning",
      "recordedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

### POST /api/v1/symptoms

Request:
```json
{
  "illnessId": "ill-001",
  "name": "Headache",
  "severity": 3,
  "notes": "Worse in the morning",
  "recordedAt": "2026-01-15T10:00:00Z"
}
```

## Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| illnessId | Yes | string | Valid UUID |
| name | Yes | string | 1-100 characters |
| severity | No | number | 1-10, default: 5 |
| notes | No | string | Max 2000 characters |
| recordedAt | No | string | ISO 8601 datetime |

## Response Codes

- 200: Success
- 201: Created
- 400: Validation error
- 404: Not found
- 500: Internal server error
