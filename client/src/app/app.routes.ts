import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) 
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'illnesses',
    loadComponent: () => import('./components/illness-list/illness-list.component').then(m => m.IllnessListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'illnesses/new',
    loadComponent: () => import('./components/illness-form/illness-form.component').then(m => m.IllnessFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'illnesses/:id',
    loadComponent: () => import('./components/illness-form/illness-form.component').then(m => m.IllnessFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'prescriptions',
    loadComponent: () => import('./components/prescription-list/prescription-list.component').then(m => m.PrescriptionListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'prescriptions/new',
    loadComponent: () => import('./components/prescription-form/prescription-form.component').then(m => m.PrescriptionFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'prescriptions/:id',
    loadComponent: () => import('./components/prescription-form/prescription-form.component').then(m => m.PrescriptionFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'appointments',
    loadComponent: () => import('./components/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'appointments/new',
    loadComponent: () => import('./components/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'appointments/:id',
    loadComponent: () => import('./components/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'doctors',
    loadComponent: () => import('./components/doctor-list/doctor-list.component').then(m => m.DoctorListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'doctors/new',
    loadComponent: () => import('./components/doctor-form/doctor-form.component').then(m => m.DoctorFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'doctors/:id',
    loadComponent: () => import('./components/doctor-form/doctor-form.component').then(m => m.DoctorFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  }
];
