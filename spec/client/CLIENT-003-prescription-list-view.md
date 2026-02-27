# CLIENT-003: Prescription List View

> **Requirement**: CLIENT-003  
> **Component**: Client  
> **Status**: Implementation Ready

## Description

Display a list of all prescriptions with filtering by illness and navigation to add/edit views.

## UI Components

### Header
- Title: "Prescriptions"
- "Add Prescription" button (primary action)

### Filter Bar
- Search input (filters by medication name)
- Illness dropdown filter (All, or select specific illness)
- Active only toggle

### Prescription List Table

| Column | Sortable | Width |
|--------|----------|-------|
| Medication | Yes | 25% |
| Dosage | No | 15% |
| Frequency | No | 15% |
| Start Date | Yes | 15% |
| End Date | Yes | 15% |
| Illness | No | 10% |
| Actions | No | 5% |

### Actions
- Edit button (pencil icon)
- Delete button (trash icon) - with confirmation

### Empty State
- "No prescriptions recorded yet"
- "Add your first prescription" button

## Interactions

1. Click "Add Prescription" → Navigate to `/prescriptions/new`
2. Click row → Navigate to `/prescriptions/:id`
3. Click edit → Navigate to `/prescriptions/:id`
4. Click delete → Show confirmation modal → Delete on confirm

## Responsive Behavior

- Desktop: Full table view
- Mobile: Card view

## Data Model

```typescript
interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes: string;
  illnessId?: string;
  illnessName?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Implementation

- Component: `prescription-list.component.ts`
- Template: `prescription-list.component.html`
- Style: `prescription-list.component.css`
