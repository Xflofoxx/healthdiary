# SERV-003: Appointment CRUD REST API

> **Requirement**: SERV-003  
> **Component**: Server  
> **Status**: Implementation Ready

## Description

The server must provide REST API endpoints for Create, Read, Update, and Delete operations on doctor appointment records.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/appointments | List all appointments |
| GET | /api/v1/appointments/:id | Get appointment by ID |
| POST | /api/v1/appointments | Create new appointment |
| PUT | /api/v1/appointments/:id | Update appointment |
| DELETE | /api/v1/appointments/:id | Delete appointment |

## Request/Response Formats

### GET /api/v1/appointments

Query Parameters:
- `illnessId` (optional): Filter by associated illness
- `dateFrom` (optional): Filter appointments from this date
- `dateTo` (optional): Filter appointments until this date

Response:
```json
{
  "appointments": [
    {
      "id": "appt-001",
      "doctorName": "Dr. Smith",
      "specialty": "General Practitioner",
      "date": "2026-02-15",
      "time": "10:30",
      "location": "123 Medical Center",
      "notes": "Annual checkup",
      "illnessId": "ill-001",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

### POST /api/v1/appointments

Request:
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

Response: 201 Created

## Validation Rules

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| doctorName | Yes | string | 1-200 characters |
| specialty | No | string | Max 100 characters |
| date | Yes | string | ISO 8601 date |
| time | No | string | HH:mm format |
| location | No | string | Max 500 characters |
| notes | No | string | Max 5000 characters |
| illnessId | No | string | Must exist in illnesses table |

## Response Codes

- 200: Success
- 201: Created
- 400: Validation error
- 404: Not found
- 500: Internal server error

## Implementation

- File: `routes/appointments.ts`
- Validate input data
- Generate UUID for new records
- Store in SQLite
- Sync to DuckDB for analytics
- Link to illness if provided
