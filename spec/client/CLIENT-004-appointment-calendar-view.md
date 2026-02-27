# CLIENT-004: Appointment Calendar View

> **Requirement**: CLIENT-004  
> **Component**: Client  
> **Status**: Implementation Ready

## Description

Display appointments in a calendar view with month navigation and list view option.

## UI Components

### Header
- Title: "Appointments"
- View toggle: Calendar / List
- "Add Appointment" button

### Calendar View

#### Month Navigation
- Previous month button
- Current month/year display
- Next month button

#### Calendar Grid
- 7 columns (Sun-Sat)
- Day cells showing:
  - Date number
  - Appointment dots (max 3 visible)
  - "+N more" if > 3 appointments

#### Day Cell Click
- Opens day detail popover showing:
  - All appointments for that day
  - Time, doctor name, specialty
  - Click to edit appointment

### List View

| Column | Sortable | Width |
|--------|----------|-------|
| Date | Yes | 15% |
| Time | Yes | 10% |
| Doctor | Yes | 25% |
| Specialty | No | 20% |
| Location | No | 20% |
| Actions | No | 10% |

### Filter Bar
- Month/Year picker
- Specialty dropdown

### Upcoming Appointments Widget
- Shows next 3 upcoming appointments
- Quick link to full calendar

### Actions
- Edit button
- Delete button - with confirmation

### Empty State
- "No appointments scheduled"
- "Schedule your first appointment" button

## Interactions

1. Click "Add Appointment" → Navigate to `/appointments/new`
2. Click calendar day → Show day detail
3. Click appointment in list → Navigate to edit
4. Click edit/delete → Same as list actions

## Data Model

```typescript
interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time?: string;
  location: string;
  notes: string;
  illnessId?: string;
  illnessName?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Implementation

- Component: `appointment-list.component.ts`
- Template: `appointment-list.component.html`
- Style: `appointment-list.component.css`
- Uses Angular date utilities
