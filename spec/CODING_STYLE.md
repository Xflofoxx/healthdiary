# Healthdiary Style Guide

> **Version**: 1.0.0  
> **Status**: Mandatory

This style guide is mandatory for all Healthdiary code. It ensures consistency, readability, and maintainability across the codebase.

## 1. General Principles

| Principle | Description |
|-----------|-------------|
| Clarity over Cleverness | Write code that is easy to understand |
| Consistency | Follow established patterns in the codebase |
| Minimalism | Avoid unnecessary complexity or abstraction |
| Self-Documenting | Use clear names; add comments only for non-obvious logic |

## 2. TypeScript Conventions

### 2.1 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables/functions | camelCase | `getIllness()`, `illnessList` |
| Classes/Interfaces/Types | PascalCase | `Illness`, `Prescription` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_LIMIT`, `MAX_RECORDS` |
| Files | kebab-case | `illness-service.ts`, `prescription-loader.ts` |

### 2.2 Type Annotations

```typescript
// Prefer explicit types for function parameters
function getIllnesses(filter: string): Illness[] {
  return illnesses.filter(i => i.name.includes(filter));
}

// Use type inference for simple cases
const count = 0;
const name = "healthdiary";
const items: string[] = [];
```

### 2.3 Interfaces vs Types

```typescript
// Use interface for object shapes
interface Illness {
  id: string;
  name: string;
  notes: string;
  startDate: string;
  endDate?: string;
}

// Use type for unions, primitives
type IllnessStatus = "active" | "resolved" | "chronic";
```

### 2.4 Imports

```typescript
// Use explicit named imports
import { getDb, type Illness } from "./db/sqlite";
import { logger } from "./utils/logger";

// Group imports: external, then internal
import { Hono } from "hono";
import { getIllness } from "../services/illness";
```

## 3. Functions

### 3.1 Arrow vs Regular Functions

```typescript
// Use arrow functions for callbacks
illnesses.map((item) => item.id);

// Use regular functions for methods or complex logic
function processIllness(payload: IllnessPayload): void {
  const illness = getIllness(payload.illnessId);
  // ...
}
```

### 3.2 Function Parameters

```typescript
// Use optional parameters with defaults
function createIllness(id: string, name?: string): Illness {
  const illnessName = name ?? `Illness-${id}`;
  // ...
}

// Use object parameters for many arguments
function searchIllnesses(options: {
  query: string;
  status: string;
  dateFrom: string;
}): Illness[] {
  // ...
}
```

## 4. Error Handling

```typescript
// Use try/catch with specific error handling
try {
  await processIllness(payload);
} catch (error) {
  logger.error(`Failed to process illness: ${error}`);
}

// Return error results explicitly
function validateInput(data: unknown): { valid: boolean; error?: string } {
  if (!data) {
    return { valid: false, error: "Data is required" };
  }
  return { valid: true };
}
```

## 5. Async/Await

```typescript
// Prefer async/await over .then()
async function fetchPrescriptions(illnessId: string): Promise<Prescription[]> {
  const response = await fetch(`/api/prescriptions/${illnessId}`);
  return response.json();
}

// Handle async errors with try/catch
async function main() {
  try {
    await run();
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
}
```

## 6. Comments

```typescript
// Add comments for non-obvious logic
// Calculate duration of illness in days
const durationDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

// Avoid obvious comments
// Loop through items
for (const item of items) {
  // ...
}
```

## 7. Testing

### 7.1 Test File Naming

```
src/services/illness.ts     →  tests/services/illness.test.ts
src/utils/logger.ts    →  tests/utils/logger.test.ts
```

### 7.2 Test Structure

```typescript
import { describe, test, expect, beforeEach } from "bun:test";
import { getIllness, createIllness } from "../services/illness";

describe("Illness Service", () => {
  let db: Database;

  beforeEach(() => {
    // Setup
  });

  test("createIllness should return new illness", () => {
    const illness = createIllness({ id: "test-1", name: "Flu" });
    expect(illness.id).toBe("test-1");
  });

  test("getIllness should return existing illness", () => {
    const illness = getIllness("test-1");
    expect(illness).toBeDefined();
  });
});
```

### 7.3 Test Naming

```typescript
// Use descriptive test names
test("createIllness should throw when id is empty", () => {
  // ...
});

test("getIllness should return undefined for non-existent illness", () => {
  // ...
});
```

## 8. File Organization

```typescript
// Order in each file
// 1. Imports (external, then internal)
// 2. Types/Interfaces
// 3. Constants
// 4. Functions/Classes
// 5. Main execution

// Maximum file length: ~200 lines
// Split large modules into separate files
```

## 9. Configuration

```typescript
// Use config files for constants
export const CONFIG = {
  DEFAULT_LIMIT: 50,
  MAX_RECORDS: 1000,
};

// Use environment variables for runtime config
const PORT = parseInt(process.env.PORT || "3000");
```

## 10. Logging

```typescript
// Use appropriate log levels
logger.debug("Processing request", { id });
logger.info("Illness created", { illnessId });
logger.warn("Retrying failed request", { attempt });
logger.error("Critical failure", { error });
```

## 11. Git Commits

```
# Use conventional commits
feat: add illness tracking
fix: resolve prescription storage error
docs: update API documentation
test: add unit tests for illness service
refactor: simplify data loading

# Avoid
fixed stuff
update
asdf
```

## 12. Code Review Checklist

- [ ] Code follows naming conventions
- [ ] Types are explicit and correct
- [ ] Error handling is appropriate
- [ ] No console.log (use logger)
- [ ] Tests cover critical paths
- [ ] No hardcoded secrets
- [ ] Code is tested

## 13. Quality Gates

Before any code is merged:

- [ ] All tests pass (`bun test`)
- [ ] Coverage meets threshold (>80%)
- [ ] No lint errors (`bun run lint`)
- [ ] Code is formatted (`bun run format`)
- [ ] TypeScript compiles without errors
