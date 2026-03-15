import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { IllnessService } from '../../services/illness.service';
import { AppointmentInput } from '../../models/appointment.model';
import { Illness } from '../../models/illness.model';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-calendar-check"></i> {{ isEdit ? 'Modifica Visita' : 'Nuova Visita' }}</h1>
          <p>{{ isEdit ? 'Modifica i dettagli della visita' : 'Pianifica una nuova visita medica' }}</p>
        </div>
      </header>

      <form (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-row">
          <div class="form-group">
            <label for="doctorName">Nome medico *</label>
            <input type="text" [(ngModel)]="form.doctorName" name="doctorName" required class="form-control" placeholder="Nome del medico">
          </div>
          <div class="form-group">
            <label for="specialty">Specialità</label>
            <input type="text" [(ngModel)]="form.specialty" name="specialty" class="form-control" placeholder="Es. Cardiologia">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="date">Data *</label>
            <input type="date" [(ngModel)]="form.date" name="date" required class="form-control">
          </div>
          <div class="form-group">
            <label for="time">Orario</label>
            <input type="time" [(ngModel)]="form.time" name="time" class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="location">Luogo</label>
            <input type="text" [(ngModel)]="form.location" name="location" class="form-control" placeholder="Indirizzo o nome struttura">
          </div>
          <div class="form-group">
            <label for="illnessId">Malattia correlata</label>
            <select [(ngModel)]="form.illnessId" name="illnessId" class="form-control">
              <option value="">Nessuna</option>
              @for (illness of illnesses; track illness.id) {
                <option [value]="illness.id">{{ illness.name }}</option>
              }
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="notes">Note</label>
            <textarea [(ngModel)]="form.notes" name="notes" rows="4" class="form-control" placeholder="Note aggiuntive..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="saving">
            <i class="fas" [class.fa-save]="!saving" [class.fa-spinner]="saving" [class.fa-spin]="saving"></i>
            {{ saving ? 'Salvataggio...' : (isEdit ? 'Salva Modifiche' : 'Crea') }}
          </button>
          <button type="button" (click)="cancel()" class="btn btn-secondary">
            <i class="fas fa-times"></i> Annulla
          </button>
          @if (isEdit) {
            <button type="button" (click)="delete()" class="btn btn-danger">
              <i class="fas fa-trash"></i> Elimina
            </button>
          }
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
    .form-group label { font-weight: 500; color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem; }
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
    .btn-danger { background: var(--danger); color: white; margin-left: auto; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }
  `]
})
export class AppointmentFormComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private illnessService = inject(IllnessService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false; 
  saving = false; 
  id = '';
  illnesses: Illness[] = [];
  
  form: AppointmentInput = { doctorName: '', specialty: '', date: '', time: '', location: '', notes: '', illnessId: '' };

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.illnessService.getIllnesses().subscribe(res => this.illnesses = res.illnesses);
    if (this.id) { this.isEdit = true; this.loadAppointment(); }
  }

  loadAppointment() {
    this.appointmentService.getAppointment(this.id).subscribe(a => {
      this.form = { doctorName: a.doctorName, specialty: a.specialty || '', date: a.date, time: a.time || '', location: a.location || '', notes: a.notes || '', illnessId: a.illnessId || '' };
    });
  }

  onSubmit() {
    if (!this.form.doctorName || !this.form.date) return;
    this.saving = true;
    const obs = this.isEdit ? this.appointmentService.updateAppointment(this.id, this.form) : this.appointmentService.createAppointment(this.form);
    obs.subscribe({ next: () => this.router.navigate(['/appointments']), error: () => this.saving = false });
  }

  cancel() { this.router.navigate(['/appointments']); }

  delete() {
    if (confirm('Sei sicuro di voler eliminare questa visita?')) {
      this.appointmentService.deleteAppointment(this.id).subscribe(() => this.router.navigate(['/appointments']));
    }
  }
}
