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
    <div class="header">
      <h1>{{ isEdit ? 'Edit Illness' : 'Add Illness' }}</h1>
    </div>

    <form (ngSubmit)="onSubmit()" class="form">
      <div class="form-group">
        <label for="name">Name *</label>
        <input 
          type="text" 
          id="name" 
          [(ngModel)]="form.name" 
          name="name"
          required
          maxlength="200"
          class="form-control"
        >
        @if (errors.name) {
          <span class="error">{{ errors.name }}</span>
        }
      </div>

      <div class="form-group">
        <label for="startDate">Start Date *</label>
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
        <label for="endDate">End Date</label>
        <input 
          type="date" 
          id="endDate" 
          [(ngModel)]="form.endDate" 
          name="endDate"
          class="form-control"
        >
      </div>

      <div class="form-group">
        <label for="status">Status</label>
        <select id="status" [(ngModel)]="form.status" name="status" class="form-control">
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="chronic">Chronic</option>
        </select>
      </div>

      <div class="form-group">
        <label for="notes">Notes</label>
        <textarea 
          id="notes" 
          [(ngModel)]="form.notes" 
          name="notes"
          rows="4"
          maxlength="5000"
          class="form-control"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" [disabled]="saving">
          {{ saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create') }}
        </button>
        <button type="button" (click)="cancel()" class="btn btn-secondary">Cancel</button>
        @if (isEdit) {
          <button type="button" (click)="delete()" class="btn btn-danger">Delete</button>
        }
      </div>
    </form>
  `,
  styles: [`
    .header { margin-bottom: 1.5rem; }
    .form { max-width: 600px; }
    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
    }
    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    textarea.form-control { resize: vertical; }
    .error { color: #dc2626; font-size: 0.875rem; }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #e2e8f0; color: #1e293b; }
    .btn-danger { background: #dc2626; color: white; margin-left: auto; }
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
      this.errors.name = 'Name is required';
    }
    if (!this.form.startDate) {
      this.errors['startDate'] = 'Start date is required';
    }
    return Object.keys(this.errors).length === 0;
  }

  cancel() {
    this.router.navigate(['/illnesses']);
  }

  delete() {
    if (confirm('Are you sure you want to delete this illness?')) {
      this.illnessService.deleteIllness(this.id).subscribe(() => {
        this.router.navigate(['/illnesses']);
      });
    }
  }
}
