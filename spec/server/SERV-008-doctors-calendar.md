# Doctors & Calendar Feature Specification

## Overview
- **Feature**: Rubrica Medici and Calendar integration
- **Status**: Implemented
- **Version**: 1.2.0

## Features

### 1. Doctors Management (Rubrica Medici)

#### API Endpoints
- `GET /api/v1/doctors` - List all doctors
- `GET /api/v1/doctors/:id` - Get doctor by ID
- `POST /api/v1/doctors` - Create new doctor
- `PUT /api/v1/doctors/:id` - Update doctor
- `DELETE /api/v1/doctors/:id` - Delete doctor

#### Data Model
```typescript
interface Doctor {
  id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

#### UI Components
- Doctor List: Card-based grid layout
- Doctor Form: Create/edit doctor with all fields

### 2. Calendar View

#### Features
- Monthly calendar grid
- Display prescriptions and appointments
- Navigate between months
- Upcoming events list
- Quick access to details

### 3. Prescriptions - Doctor Link

#### Database Changes
Added `doctor_id` foreign key to prescriptions table

#### API Updates
- POST /api/v1/prescriptions - Accepts doctorId
- PUT /api/v1/prescriptions/:id - Accepts doctorId
- GET /api/v1/prescriptions - Returns doctor info

### 4. Dashboard

#### Features
- Statistics cards (illnesses, prescriptions, appointments, pending)
- Pie chart for illness status
- Upcoming appointments
- Today's prescriptions
- Recent illnesses
- Quick action buttons

## Acceptance Criteria

1. ✅ Doctors can be created, edited, deleted
2. ✅ Doctors can be linked to prescriptions
3. ✅ Calendar shows prescriptions and appointments
4. ✅ Dashboard shows health summary
5. ✅ All pages use consistent white/purple theme
6. ✅ All text is in Italian
