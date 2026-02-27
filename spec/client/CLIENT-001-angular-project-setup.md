# CLIENT-001: Angular Project Setup

> **Requirement**: CLIENT-001  
> **Component**: Client  
> **Status**: Implementation Ready

## Description

Set up Angular project with proper structure, routing, and HTTP client for communicating with the server.

## Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── illness-list/
│   │   │   ├── illness-form/
│   │   │   ├── prescription-list/
│   │   │   ├── prescription-form/
│   │   │   ├── appointment-list/
│   │   │   └── appointment-form/
│   │   ├── services/
│   │   │   ├── illness.service.ts
│   │   │   ├── prescription.service.ts
│   │   │   └── appointment.service.ts
│   │   ├── models/
│   │   │   ├── illness.model.ts
│   │   │   ├── prescription.model.ts
│   │   │   └── appointment.model.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── styles.css
│   └── index.html
├── angular.json
├── package.json
└── tsconfig.json
```

## Angular Version

- Angular: 19+
- Use standalone components
- Use new control flow syntax (@if, @for)

## Services

### IllnessService

```typescript
@Injectable({ providedIn: 'root' })
export class IllnessService {
  private apiUrl = '/api/v1/illnesses';
  
  getIllnesses(): Observable<Illness[]>
  getIllness(id: string): Observable<Illness>
  createIllness(illness: Illness): Observable<Illness>
  updateIllness(id: string, illness: Illness): Observable<Illness>
  deleteIllness(id: string): Observable<void>
}
```

### PrescriptionService

```typescript
@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private apiUrl = '/api/v1/prescriptions';
  
  getPrescriptions(illnessId?: string): Observable<Prescription[]>
  getPrescription(id: string): Observable<Prescription>
  createPrescription(prescription: Prescription): Observable<Prescription>
  updatePrescription(id: string, prescription: Prescription): Observable<Prescription>
  deletePrescription(id: string): Observable<void>
}
```

### AppointmentService

```typescript
@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = '/api/v1/appointments';
  
  getAppointments(filters?: AppointmentFilters): Observable<Appointment[]>
  getAppointment(id: string): Observable<Appointment>
  createAppointment(appointment: Appointment): Observable<Appointment>
  updateAppointment(id: string, appointment: Appointment): Observable<Appointment>
  deleteAppointment(id: string): Observable<void>
}
```

## Routing

```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/illnesses', pathMatch: 'full' },
  { path: 'illnesses', component: IllnessListComponent },
  { path: 'illnesses/new', component: IllnessFormComponent },
  { path: 'illnesses/:id', component: IllnessFormComponent },
  { path: 'prescriptions', component: PrescriptionListComponent },
  { path: 'prescriptions/new', component: PrescriptionFormComponent },
  { path: 'prescriptions/:id', component: PrescriptionFormComponent },
  { path: 'appointments', component: AppointmentListComponent },
  { path: 'appointments/new', component: AppointmentFormComponent },
  { path: 'appointments/:id', component: AppointmentFormComponent },
];
```

## HTTP Client Configuration

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
  ]
};
```

## Development Commands

```bash
# Install dependencies
cd client && bun install

# Development mode
bun start

# Build for production
bun run build

# Run tests
bun test
```
