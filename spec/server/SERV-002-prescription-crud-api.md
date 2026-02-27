# SERV-002: Prescription CRUD REST API

> **Requirement**: SERV-002  
> **Component**: Server  
> **Status**: Implementation Ready

## Description

The server must provide REST API endpoints for Create, Read, Update, and Delete operations on prescription records.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/prescriptions | List all prescriptions |
| GET | /api/v1/prescriptions/:id | Get prescription by ID |
| POST | /api/v1/prescriptions | Create new prescription |
| PUT | /api/v1/prescriptions/:id | Update prescription |
| DELETE | /api/v1/prescriptions/:id | Delete prescription |

## Request/Response Formats

### GET /api/v1/prescriptions

Query Parameters:
- `illnessId` (optional): Filter by associated illness
- `active` (optional): Filter by active status

Response:
```json
{
  "prescriptions": [
    {
      "id": "pres-001",
      "medication": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "startDate": "2026-01-15",
      "endDate": "2026-01-22",
      "notes": "Take with food",
      "illnessId": "ill-001",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

### POST /api/v1/prescriptions

Request:
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

Response: 201 Created

## Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| medication | Yes | string | 1-200 characters |
| dosage | No | string | Max 100 characters |
| frequency | No | string | Max 100 characters |
| startDate | Yes | string | ISO 8601 date |
| endDate | No | string | ISO 8601 date, must be >= startDate |
| notes | No | string | Max 5000 characters |
| illnessId | No | string | Must exist in illnesses table |

## Response Codes

- 200: Success
- 201: Created
- 400: Validation error
- 404: Not found
- 500: Internal server error

## Implementation

- File: `routes/prescriptions.ts`
- Validate input data
- Generate UUID for new records
- Store in SQLite
- Sync to DuckDB for analytics
- Link to illness if provided
