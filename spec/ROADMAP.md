# Version Roadmap

> **Version**: 1.0.0  
> **Status**: Released  
> **Last Updated**: 2026-03-08

---

## Overview

This document outlines the planned versions and their associated requirements.

---

## Version 1.0.0 - Foundation

**Release Date**: 2026-03-08  
**Status**: ✅ Released

### Core Entities

| ID | Requirement | Status |
|----|-------------|--------|
| CORE-001 | Illness tracking | ✅ Complete |
| CORE-002 | Prescription management | ✅ Complete |
| CORE-003 | Doctor appointment scheduling | ✅ Complete |

### Server Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| SERV-001 | REST API for illness CRUD | ✅ Complete |
| SERV-002 | REST API for prescription CRUD | ✅ Complete |
| SERV-003 | REST API for appointment CRUD | ✅ Complete |
| SERV-004 | SQLite database setup (bun:sqlite) | ✅ Complete |
| SERV-005 | DuckDB analytics setup | ✅ Complete |
| SERV-006 | Health check endpoint | ✅ Complete |

### Client Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| CLIENT-001 | Angular project setup | ✅ Complete |
| CLIENT-002 | Illness list view | ✅ Complete |
| CLIENT-003 | Prescription list view | ✅ Complete |
| CLIENT-004 | Appointment list view | ✅ Complete |
| CLIENT-005 | Add/Edit forms | ✅ Complete |

---

## Version 1.1.0 - Enhanced Features

**Target Date**: TBD  
**Status**: Planned

### Planned Features

| ID | Requirement | Status |
|----|-------------|--------|
| CORE-004 | Symptom tracking | Planned |
| CORE-005 | Medication reminders | Planned |
| CORE-006 | Export data to PDF | Planned |
| SERV-007 | Data export functionality | Planned |
| CLIENT-006 | Dashboard with statistics | Planned |
| CLIENT-007 | Dark/Light theme | Planned |

---

## Version 1.2.0 - Advanced Analytics

**Target Date**: TBD  
**Status**: Planned

### Planned Features

| ID | Requirement | Status |
|----|-------------|--------|
| SERV-008 | Analytics queries in DuckDB | Planned |
| SERV-009 | Trend analysis | Planned |
| CLIENT-008 | Charts and visualizations | Planned |
| CLIENT-009 | Date range filters | Planned |

---

## Release Schedule

| Version | Focus | Release Date | Status |
|---------|-------|-------------|--------|
| 1.0.0 | Foundation | 2026-03-08 | ✅ Released |
| 1.1.0 | Enhanced Features | TBD | Planned |
| 1.2.0 | Advanced Analytics | TBD | Planned |

---

## Contributing

To contribute a new requirement:

1. Create a spec branch: `git checkout -b spec/XXX-feature-name`
2. Write the requirement spec following existing patterns
3. Submit for review
4. Assign to appropriate version milestone
5. Implement and test
6. Merge to master

---

## Document History

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-27 | 1.0.0 | Initial roadmap created |
| 2026-03-08 | 1.0.0 | Foundation release - all v1.0.0 features complete |
