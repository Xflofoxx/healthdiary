import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthService, Doctor } from '../../services/health.service';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1><i class="fas fa-user-md"></i> {{ isEdit ? 'Modifica Medico' : 'Nuovo Medico' }}</h1>
      </header>

      <form (ngSubmit)="saveDoctor()" class="doctor-form">
        <div class="form-group">
          <label for="name">Nome *</label>
          <input type="text" id="name" [(ngModel)]="doctor.name" name="name" required class="form-control">
        </div>

        <div class="form-group">
          <label for="specialty">Specializzazione</label>
          <input type="text" id="specialty" [(ngModel)]="doctor.specialty" name="specialty" class="form-control">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="phone"><i class="fas fa-phone"></i> Telefono</label>
            <input type="tel" id="phone" [(ngModel)]="doctor.phone" name="phone" class="form-control">
          </div>
          <div class="form-group">
            <label for="email"><i class="fas fa-envelope"></i> Email</label>
            <input type="email" id="email" [(ngModel)]="doctor.email" name="email" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label for="address"><i class="fas fa-map-marker-alt"></i> Indirizzo</label>
          <textarea id="address" [(ngModel)]="doctor.address" name="address" rows="2" class="form-control"></textarea>
        </div>

        <div class="form-group">
          <label for="notes"><i class="fas fa-sticky-note"></i> Note</label>
          <textarea id="notes" [(ngModel)]="doctor.notes" name="notes" rows="3" class="form-control"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="cancel()">Annulla</button>
          <button type="submit" class="btn btn-primary" [disabled]="!doctor.name">
            <i class="fas fa-save"></i> Salva
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container { max-width: 600px; margin: 0 auto; padding: 2rem; }
    .page-header h1 { color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; }
    .doctor-form { background: white; padding: 2rem; border-radius: 16px; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 500; }
    .form-group label i { margin-right: 0.5rem; color: var(--primary-color); }
    .form-control { width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; }
    .form-control:focus { outline: none; border-color: var(--primary-color); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-primary:hover:not(:disabled) { background: #5a67d8; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #e5e7eb; color: var(--text-secondary); }
    .btn-secondary:hover { background: #d1d5db; }
  `]
})
export class DoctorFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private healthService = inject(HealthService);

  doctor: Partial<Doctor> = {};
  isEdit = false;
  doctorId = '';

  ngOnInit() {
    this.doctorId = this.route.snapshot.paramMap.get('id') || '';
    if (this.doctorId) {
      this.isEdit = true;
      this.loadDoctor();
    }
  }

  loadDoctor() {
    this.healthService.getDoctor(this.doctorId).subscribe({
      next: (doc) => this.doctor = doc,
      error: () => this.router.navigate(['/doctors'])
    });
  }

  saveDoctor() {
    if (!this.doctor.name) return;

    if (this.isEdit) {
      this.healthService.updateDoctor(this.doctorId, this.doctor).subscribe({
        next: () => this.router.navigate(['/doctors'])
      });
    } else {
      this.healthService.createDoctor(this.doctor).subscribe({
        next: () => this.router.navigate(['/doctors'])
      });
    }
  }

  cancel() {
    this.router.navigate(['/doctors']);
  }
}
