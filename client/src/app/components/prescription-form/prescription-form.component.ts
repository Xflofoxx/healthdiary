import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthService, Doctor, Illness } from '../../services/health.service';
import { COMMON_MEDICATIONS, CommonMedication } from '../../data/common-medications';

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-pills"></i> {{ isEdit ? 'Modifica Farmaco' : 'Nuovo Farmaco' }}</h1>
          <p>{{ isEdit ? 'Modifica i dettagli della prescrizione' : 'Registra un nuovo farmaco' }}</p>
        </div>
      </header>

      <form (ngSubmit)="onSubmit()" class="prescription-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="medication"><i class="fas fa-pills"></i> Farmaco *</label>
            <input type="text" 
                   id="medication" 
                   [(ngModel)]="form.medication" 
                   name="medication" 
                   required 
                   class="form-control" 
                   placeholder="Nome del farmaco"
                   list="common-medications"
                   (change)="onMedicationChange()">
            <datalist id="common-medications">
              @for (med of commonMedications; track med.id) {
                <option [value]="med.name">{{ med.substance }} - {{ med.dosage }}</option>
              }
            </datalist>
          </div>

          @if (selectedMedication) {
            <div class="med-info">
              <div class="med-detail">
                <span class="med-label">Sostanza:</span>
                <span class="med-value">{{ selectedMedication.substance }}</span>
              </div>
              <div class="med-detail">
                <span class="med-label">Dosaggio:</span>
                <span class="med-value">{{ selectedMedication.dosage }}</span>
              </div>
              <div class="med-detail">
                <span class="med-label">Utilizzo:</span>
                <span class="med-value">{{ selectedMedication.usage }}</span>
              </div>
              <div class="med-detail">
                <span class="med-label">Categoria:</span>
                <span class="med-value category-badge">{{ selectedMedication.category }}</span>
              </div>
            </div>
          }

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
    .page-container { max-width: 700px; margin: 0 auto; padding: 2rem; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { color: var(--primary-color); display: flex; align-items: center; gap: 0.75rem; }
    .page-header p { color: var(--text-muted); margin-top: 0.5rem; }
    .prescription-form { background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-weight: 500; color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
    .form-group label i { color: var(--primary-color); }
    .form-control { width: 100%; padding: 0.75rem 1rem; border: 2px solid var(--border-color); border-radius: 8px; font-size: 1rem; transition: border-color 0.2s, box-shadow 0.2s; background: white; }
    .form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(102,126,234,0.15); }
    .form-control::placeholder { color: var(--text-muted); }
    textarea.form-control { resize: vertical; min-height: 100px; }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%); color: white; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
    .btn-secondary { background: var(--bg-tertiary); color: var(--text-secondary); }
    .btn-secondary:hover:not(:disabled) { background: var(--border-color); }
    .btn-danger { background: var(--danger); color: white; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }
    .med-info { grid-column: 1 / -1; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 1rem; margin-top: 0.5rem; }
    .med-detail { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .med-detail:last-child { margin-bottom: 0; }
    .med-label { font-weight: 600; color: var(--text-secondary); min-width: 80px; }
    .med-value { color: var(--text-primary); }
    .category-badge { background: #dbeafe; color: #2563eb; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
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
  commonMedications = COMMON_MEDICATIONS;
  selectedMedication: CommonMedication | null = null;
  
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
      this.onMedicationChange();
    });
  }

  onMedicationChange() {
    const medName = this.form.medication?.toLowerCase().trim();
    if (!medName) {
      this.selectedMedication = null;
      return;
    }
    const found = this.commonMedications.find(m => m.name.toLowerCase() === medName);
    this.selectedMedication = found || null;
    if (this.selectedMedication && !this.form.dosage) {
      this.form.dosage = this.selectedMedication.dosage;
    }
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
