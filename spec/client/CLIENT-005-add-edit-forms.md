# CLIENT-005: Add/Edit Forms

> **Requirement**: CLIENT-005  
> **Component**: Client  
> **Status**: Implementation Ready

## Description

Reusable form component for creating and editing illnesses, prescriptions, and appointments.

## Illness Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | Text input | Yes | 1-200 characters |
| Notes | Textarea | No | Max 5000 characters |
| Start Date | Date picker | Yes | Required |
| End Date | Date picker | No | Must be >= start date |
| Status | Select | No | Options: Active, Resolved, Chronic |

## Prescription Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Medication | Text input | Yes | 1-200 characters |
| Dosage | Text input | No | Max 100 characters |
| Frequency | Text input | No | Max 100 characters |
| Start Date | Date picker | Yes | Required |
| End Date | Date picker | No | Must be >= start date |
| Notes | Textarea | No | Max 5000 characters |
| Illness | Select | No | Dropdown of illnesses |

## Appointment Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Doctor Name | Text input | Yes | 1-200 characters |
| Specialty | Text input | No | Max 100 characters |
| Date | Date picker | Yes | Required |
| Time | Time picker | No | HH:mm format |
| Location | Text input | No | Max 500 characters |
| Notes | Textarea | No | Max 5000 characters |
| Illness | Select | No | Dropdown of illnesses |

## Form Behavior

### Create Mode
- Title: "Add [Entity]"
- Submit button: "Create"
- Cancel button: Navigate back

### Edit Mode
- Title: "Edit [Entity Name]"
- Submit button: "Save Changes"
- Cancel button: Navigate back
- Delete button: Show confirmation modal

### Validation
- Real-time validation feedback
- Show error messages below fields
- Disable submit until valid

### Loading States
- Show spinner during API calls
- Disable form during submission

## Implementation

- Base form component: `form-base.component.ts`
- Illness form: `illness-form.component.ts`
- Prescription form: `prescription-form.component.ts`
- Appointment form: `appointment-form.component.ts`

Use Angular Reactive Forms:
```typescript
export class IllnessFormComponent {
  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    notes: new FormControl('', [Validators.maxLength(5000)]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl(''),
    status: new FormControl('active'),
  });
}
```
