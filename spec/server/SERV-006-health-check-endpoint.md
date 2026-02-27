# SERV-006: Health Check Endpoint

> **Requirement**: SERV-006  
> **Component**: Server  
> **Status**: Implementation Ready

## Description

The server must provide a health check endpoint for monitoring and load balancer readiness probes.

## Endpoint

```
GET /health
```

## Response

### Healthy

```json
{
  "status": "healthy",
  "timestamp": "2026-02-27T10:00:00Z",
  "uptime": 3600,
  "services": {
    "sqlite": "connected",
    "duckdb": "connected"
  }
}
```

### Unhealthy

```json
{
  "status": "unhealthy",
  "timestamp": "2026-02-27T10:00:00Z",
  "error": "Database connection failed",
  "services": {
    "sqlite": "error",
    "duckdb": "error"
  }
}
```

## Health Checks

| Service | Check |
|---------|-------|
| SQLite | Execute `SELECT 1` |
| DuckDB | Execute `SELECT 1` |
| Server | Internal state |

## Response Codes

- 200: Healthy
- 503: Unhealthy

## Implementation

- File: `routes/health.ts`
- No authentication required
- Lightweight checks only
- Include server uptime in seconds

## Usage

```bash
# Check health
curl http://localhost:3000/health

# Docker health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```
