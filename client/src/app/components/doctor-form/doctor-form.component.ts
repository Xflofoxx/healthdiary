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
        <div class="header-content">
          <h1><i class="fas fa-user-md"></i> {{ isEdit ? 'Modifica Medico' : 'Nuovo Medico' }}</h1>
          <p>{{ isEdit ? 'Modifica i dettagli del medico' : 'Aggiungi un nuovo medico alla tua rubrica' }}</p>
        </div>
      </header>

      <form (ngSubmit)="saveDoctor()" class="form-card">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Nome *</label>
            <input type="text" id="name" [(ngModel)]="doctor.name" name="name" required class="form-control" placeholder="Nome e cognome del medico">
          </div>
          <div class="form-group">
            <label for="specialty">Specializzazione</label>
            <input type="text" id="specialty" [(ngModel)]="doctor.specialty" name="specialty" class="form-control" placeholder="Es. Cardiologia">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="phone"><i class="fas fa-phone"></i> Telefono</label>
            <input type="tel" id="phone" [(ngModel)]="doctor.phone" name="phone" class="form-control" placeholder="Numero di telefono">
          </div>
          <div class="form-group">
            <label for="email"><i class="fas fa-envelope"></i> Email</label>
            <input type="email" id="email" [(ngModel)]="doctor.email" name="email" class="form-control" placeholder="Email del medico">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="address"><i class="fas fa-map-marker-alt"></i> Indirizzo</label>
            <textarea id="address" [(ngModel)]="doctor.address" name="address" rows="2" class="form-control" placeholder="Indirizzo dello studio"></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="notes"><i class="fas fa-sticky-note"></i> Note</label>
            <textarea id="notes" [(ngModel)]="doctor.notes" name="notes" rows="3" class="form-control" placeholder="Note aggiuntive..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="cancel()">
            <i class="fas fa-times"></i> Annulla
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="!doctor.name">
            <i class="fas fa-save"></i> Salva
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container { max-width: 700px; margin: 0 auto; padding: 2rem; }
    .page-header { margin-bottom: 2rem; }
    .header-content h1 { color: var(--primary-color); display: flex; align-items: center; gap: 0.75rem; }
    .header-content p { color: var(--text-muted); margin-top: 0.5rem; }
    .form-card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-weight: 500; color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
    .form-group label i { color: var(--primary-color); }
    .form-control { width: 100%; padding: 0.75rem 1rem; border: 2px solid var(--border-color); border-radius: 8px; font-size: 1rem; transition: border-color 0.2s, box-shadow 0.2s; background: white; }
    .form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(102,126,234,0.15); }
    .form-control::placeholder { color: var(--text-muted); }
    textarea.form-control { resize: vertical; min-height: 80px; }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%); color: white; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
    .btn-secondary { background: var(--bg-tertiary); color: var(--text-secondary); }
    .btn-secondary:hover:not(:disabled) { background: var(--border-color); }
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
