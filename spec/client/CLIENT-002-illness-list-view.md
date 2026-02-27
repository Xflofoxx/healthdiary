# CLIENT-002: Illness List View

> **Requirement**: CLIENT-002  
> **Component**: Client  
> **Status**: Implementation Ready

## Description

Display a list of all illnesses with sorting, filtering, and navigation to add/edit views.

## UI Components

### Header
- Title: "Illnesses"
- "Add Illness" button (primary action)

### Filter Bar
- Search input (filters by name)
- Status dropdown filter (All, Active, Resolved, Chronic)

### Illness List Table

| Column | Sortable | Width |
|--------|----------|-------|
| Name | Yes | 30% |
| Start Date | Yes | 15% |
| End Date | Yes | 15% |
| Status | Yes | 15% |
| Duration | No | 15% |
| Actions | No | 10% |

### Status Badges
- Active: Blue badge
- Resolved: Green badge
- Chronic: Orange badge

### Actions
- Edit button (pencil icon)
- Delete button (trash icon) - with confirmation

### Empty State
- "No illnesses recorded yet"
- "Add your first illness" button

### Pagination
- 20 items per page
- Previous/Next buttons
- Page number display

## Interactions

1. Click "Add Illness" → Navigate to `/illnesses/new`
2. Click row → Navigate to `/illnesses/:id`
3. Click edit → Navigate to `/illnesses/:id`
4. Click delete → Show confirmation modal → Delete on confirm

## Responsive Behavior

- Desktop: Full table view
- Tablet: Horizontal scroll table
- Mobile: Card view (one illness per row)

## Data Model

```typescript
interface Illness {
  id: string;
  name: string;
  notes: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'resolved' | 'chronic';
  createdAt: string;
  updatedAt: string;
}
```

## Implementation

- Component: `illness-list.component.ts`
- Template: `illness-list.component.html`
- Style: `illness-list.component.css`
