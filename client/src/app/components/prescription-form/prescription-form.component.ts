import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthService, Doctor, Illness } from '../../services/health.service';

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1><i class="fas fa-prescription"></i> {{ isEdit ? 'Modifica Farmaco' : 'Nuovo Farmaco' }}</h1>
      </header>

      <form (ngSubmit)="onSubmit()" class="prescription-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="medication"><i class="fas fa-pills"></i> Farmaco *</label>
            <input type="text" id="medication" [(ngModel)]="form.medication" name="medication" required class="form-control" placeholder="Nome del farmaco">
          </div>

          <div class="form-group">
            <label for="dosage"><i class="fas fa-weight"></i> Dosaggio</label>
            <input type="text" id="dosage" [(ngModel)]="form.dosage" name="dosage" class="form-control" placeholder="es. 500mg">
          </div>

          <div class="form-group">
            <label for="frequency"><i class="fas fa-clock"></i> Frequenza</label>
            <input type="text" id="frequency" [(ngModel)]="form.frequency" name="frequency" class="form-control" placeholder="es. 2 volte al giorno">
          </div>

          <div class="form-group">
            <label for="doctorId"><i class="fas fa-user-md"></i> Medico</label>
            <select id="doctorId" [(ngModel)]="form.doctorId" name="doctorId" class="form-control">
              <option value="">Seleziona medico</option>
              @for (doctor of doctors; track doctor.id) {
                <option [value]="doctor.id">{{ doctor.name }} - {{ doctor.specialty || 'Generale' }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="illnessId"><i class="fas fa-user-injured"></i> Malattia</label>
            <select id="illnessId" [(ngModel)]="form.illnessId" name="illnessId" class="form-control">
              <option value="">Nessuna</option>
              @for (illness of illnesses; track illness.id) {
                <option [value]="illness.id">{{ illness.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="startDate"><i class="fas fa-calendar-start"></i> Data Inizio *</label>
            <input type="date" id="startDate" [(ngModel)]="form.startDate" name="startDate" required class="form-control">
          </div>

          <div class="form-group">
            <label for="endDate"><i class="fas fa-calendar-end"></i> Data Fine</label>
            <input type="date" id="endDate" [(ngModel)]="form.endDate" name="endDate" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label for="notes"><i class="fas fa-sticky-note"></i> Note</label>
          <textarea id="notes" [(ngModel)]="form.notes" name="notes" rows="3" class="form-control" placeholder="Note aggiuntive..."></textarea>
        </div>

        <div class="form-actions">
          <button type="button" (click)="cancel()" class="btn btn-secondary">Annulla</button>
          @if (isEdit) {
            <button type="button" (click)="delete()" class="btn btn-danger"><i class="fas fa-trash"></i> Elimina</button>
          }
          <button type="submit" class="btn btn-primary" [disabled]="saving || !form.medication || !form.startDate">
            <i class="fas fa-save"></i> {{ saving ? 'Salvataggio...' : 'Salva' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .page-header h1 { color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; }
    .prescription-form { background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-secondary); }
    .form-group label i { margin-right: 0.5rem; color: var(--primary-color); }
    .form-control { width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; }
    .form-control:focus { outline: none; border-color: var(--primary-color); }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: var(--bg-tertiary); color: var(--text-secondary); }
    .btn-secondary:hover { background: var(--border-color); }
    .btn-danger { background: var(--danger); color: white; }
    .btn-danger:hover { background: #dc2626; }
  `]
})
export class PrescriptionFormComponent implements OnInit {
  private healthService = inject(HealthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  saving = false;
  id = '';
  illnesses: Illness[] = [];
  doctors: Doctor[] = [];
  
  form = {
    medication: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    notes: '',
    illnessId: '',
    doctorId: ''
  };

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    
    this.healthService.getIllnesses().subscribe(res => this.illnesses = res.illnesses);
    this.healthService.getDoctors().subscribe(res => this.doctors = res.doctors);
    
    if (this.id) {
      this.isEdit = true;
      this.loadPrescription();
    }
  }

  loadPrescription() {
    this.healthService.getPrescription(this.id).subscribe(p => {
      this.form = {
        medication: p.medication,
        dosage: p.dosage || '',
        frequency: p.frequency || '',
        startDate: p.startDate,
        endDate: p.endDate || '',
        notes: p.notes || '',
        illnessId: p.illnessId || '',
        doctorId: (p as any).doctorId || ''
      };
    });
  }

  onSubmit() {
    if (!this.form.medication || !this.form.startDate) return;
    this.saving = true;
    
    const data = {
      ...this.form,
      illnessId: this.form.illnessId || undefined,
      doctorId: this.form.doctorId || undefined
    };
    
    const obs = this.isEdit 
      ? this.healthService.updatePrescription(this.id, data)
      : this.healthService.createPrescription(data);
    
    obs.subscribe({
      next: () => this.router.navigate(['/prescriptions']),
      error: () => this.saving = false
    });
  }

  cancel() {
    this.router.navigate(['/prescriptions']);
  }

  delete() {
    if (confirm('Sei sicuro di voler eliminare questa prescrizione?')) {
      this.healthService.deletePrescription(this.id).subscribe(() => this.router.navigate(['/prescriptions']));
    }
  }
}
