import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/illnesses', pathMatch: 'full' },
  {
    path: 'illnesses',
    loadComponent: () => import('./components/illness-list/illness-list.component').then(m => m.IllnessListComponent)
  },
  {
    path: 'illnesses/new',
    loadComponent: () => import('./components/illness-form/illness-form.component').then(m => m.IllnessFormComponent)
  },
  {
    path: 'illnesses/:id',
    loadComponent: () => import('./components/illness-form/illness-form.component').then(m => m.IllnessFormComponent)
  },
  {
    path: 'prescriptions',
    loadComponent: () => import('./components/prescription-list/prescription-list.component').then(m => m.PrescriptionListComponent)
  },
  {
    path: 'prescriptions/new',
    loadComponent: () => import('./components/prescription-form/prescription-form.component').then(m => m.PrescriptionFormComponent)
  },
  {
    path: 'prescriptions/:id',
    loadComponent: () => import('./components/prescription-form/prescription-form.component').then(m => m.PrescriptionFormComponent)
  },
  {
    path: 'appointments',
    loadComponent: () => import('./components/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent)
  },
  {
    path: 'appointments/new',
    loadComponent: () => import('./components/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent)
  },
  {
    path: 'appointments/:id',
    loadComponent: () => import('./components/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent)
  }
];
