# SERV-007: User Authentication with WebAuthn

> **Requirement**: SERV-007  
> **Component**: Server  
> **Status**: Implementation Ready

## Description

Implement user authentication using WebAuthn (FIDO2) standard for secure, passwordless authentication. Users can register their devices (computers, phones, security keys) and authenticate using biometrics or device PIN.

## WebAuthn Flow

### Registration Flow

1. User visits registration page
2. Server generates challenge and sends to client
3. Client creates credential using authenticator
4. Client sends credential to server
5. Server verifies and stores credential

### Authentication Flow

1. User visits login page
2. Server generates challenge and sends to client
3. Client asserts using registered authenticator
4. Client sends assertion to server
5. Server verifies and creates session

## Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /auth/register/options | Get registration options | No |
| POST | /auth/register/verify | Verify and store credential | No |
| GET | /auth/login/options | Get login options | No |
| POST | /auth/login/verify | Verify and create session | No |
| POST | /auth/logout | Logout and destroy session | Yes |
| GET | /auth/me | Get current user | Yes |

## Data Model

### Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Credentials Table

```sql
CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  credential_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  device_type TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Sessions Table

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Implementation

- File: `routes/auth.ts`
- Use `@simplewebauthn/server` for WebAuthn operations
- Store sessions in SQLite
- Session cookie with httpOnly and secure flags

## Security Considerations

- Challenge must be cryptographically random (32 bytes)
- Credentials are device-bound and non-exportable
- User verification required for authentication
- Rate limiting on login attempts
- Session timeout after 7 days of inactivity
