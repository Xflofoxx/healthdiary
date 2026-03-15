import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IllnessService } from '../../services/illness.service';
import { Illness, IllnessInput } from '../../models/illness.model';

@Component({
  selector: 'app-illness-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-user-injured"></i> {{ isEdit ? 'Modifica Malattia' : 'Nuova Malattia' }}</h1>
          <p>{{ isEdit ? 'Modifica i dettagli della malattia' : 'Registra una nuova malattia' }}</p>
        </div>
      </header>

      <form (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Nome *</label>
            <input 
              type="text" 
              id="name" 
              [(ngModel)]="form.name" 
              name="name"
              required
              maxlength="200"
              class="form-control"
              placeholder="Inserisci il nome della malattia"
            >
            @if (errors['name']) {
              <span class="error">{{ errors['name'] }}</span>
            }
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="startDate">Data inizio *</label>
            <input 
              type="date" 
              id="startDate" 
              [(ngModel)]="form.startDate" 
              name="startDate"
              required
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="endDate">Data fine</label>
            <input 
              type="date" 
              id="endDate" 
              [(ngModel)]="form.endDate" 
              name="endDate"
              class="form-control"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="status">Stato</label>
            <select id="status" [(ngModel)]="form.status" name="status" class="form-control">
              <option value="active">Attiva</option>
              <option value="resolved">Risolta</option>
              <option value="chronic">Cronica</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="notes">Note</label>
            <textarea 
              id="notes" 
              [(ngModel)]="form.notes" 
              name="notes"
              rows="4"
              maxlength="5000"
              class="form-control"
              placeholder="Note aggiuntive..."
            ></textarea>
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
    .error { color: var(--danger); font-size: 0.85rem; margin-top: 0.25rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%); color: white; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
    .btn-secondary { background: var(--bg-tertiary); color: var(--text-secondary); }
    .btn-secondary:hover:not(:disabled) { background: var(--border-color); }
    .btn-danger { background: var(--danger); color: white; margin-left: auto; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }
  `]
})
export class IllnessFormComponent implements OnInit {
  private illnessService = inject(IllnessService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  saving = false;
  id = '';
  
  form: IllnessInput = {
    name: '',
    notes: '',
    startDate: '',
    endDate: undefined,
    status: 'active'
  };

  errors: Record<string, string> = {};

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.isEdit = true;
      this.loadIllness();
    }
  }

  loadIllness() {
    this.illnessService.getIllness(this.id).subscribe({
      next: (illness) => {
        this.form = {
          name: illness.name,
          notes: illness.notes || '',
          startDate: illness.startDate,
          endDate: illness.endDate || undefined,
          status: illness.status
        };
      }
    });
  }

  onSubmit() {
    if (!this.validate()) return;
    
    this.saving = true;
    const obs = this.isEdit
      ? this.illnessService.updateIllness(this.id, this.form)
      : this.illnessService.createIllness(this.form);

    obs.subscribe({
      next: () => {
        this.router.navigate(['/illnesses']);
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  validate(): boolean {
    this.errors = {};
    if (!this.form.name?.trim()) {
      this.errors['name'] = 'Il nome è obbligatorio';
    }
    if (!this.form.startDate) {
      this.errors['startDate'] = 'La data di inizio è obbligatoria';
    }
    return Object.keys(this.errors).length === 0;
  }

  cancel() {
    this.router.navigate(['/illnesses']);
  }

  delete() {
    if (confirm('Sei sicuro di voler eliminare questa malattia?')) {
      this.illnessService.deleteIllness(this.id).subscribe(() => {
        this.router.navigate(['/illnesses']);
      });
    }
  }
}
