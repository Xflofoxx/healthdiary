import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionService } from '../../services/prescription.service';
import { IllnessService } from '../../services/illness.service';
import { PrescriptionInput } from '../../models/prescription.model';
import { Illness } from '../../models/illness.model';

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header"><h1>{{ isEdit ? 'Edit Prescription' : 'Add Prescription' }}</h1></div>
    <form (ngSubmit)="onSubmit()" class="form">
      <div class="form-group">
        <label>Medication *</label>
        <input type="text" [(ngModel)]="form.medication" name="medication" required class="form-control">
      </div>
      <div class="form-group">
        <label>Dosage</label>
        <input type="text" [(ngModel)]="form.dosage" name="dosage" class="form-control">
      </div>
      <div class="form-group">
        <label>Frequency</label>
        <input type="text" [(ngModel)]="form.frequency" name="frequency" class="form-control">
      </div>
      <div class="form-group">
        <label>Start Date *</label>
        <input type="date" [(ngModel)]="form.startDate" name="startDate" required class="form-control">
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input type="date" [(ngModel)]="form.endDate" name="endDate" class="form-control">
      </div>
      <div class="form-group">
        <label>Illness</label>
        <select [(ngModel)]="form.illnessId" name="illnessId" class="form-control">
          <option value="">None</option>
          @for (illness of illnesses; track illness.id) {
            <option [value]="illness.id">{{ illness.name }}</option>
          }
        </select>
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea [(ngModel)]="form.notes" name="notes" rows="4" class="form-control"></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create') }}</button>
        <button type="button" (click)="cancel()" class="btn btn-secondary">Cancel</button>
        @if (isEdit) { <button type="button" (click)="delete()" class="btn btn-danger">Delete</button> }
      </div>
    </form>
  `,
  styles: [`
    .header { margin-bottom: 1.5rem; }
    .form { max-width: 600px; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 1rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 500; cursor: pointer; border: none; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #e2e8f0; color: #1e293b; }
    .btn-danger { background: #dc2626; color: white; margin-left: auto; }
  `]
})
export class PrescriptionFormComponent implements OnInit {
  private prescriptionService = inject(PrescriptionService);
  private illnessService = inject(IllnessService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false; saving = false; id = '';
  illnesses: Illness[] = [];
  
  form: PrescriptionInput = { medication: '', dosage: '', frequency: '', startDate: '', notes: '', illnessId: '' };

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.illnessService.getIllnesses().subscribe(res => this.illnesses = res.illnesses);
    if (this.id) { this.isEdit = true; this.loadPrescription(); }
  }

  loadPrescription() {
    this.prescriptionService.getPrescription(this.id).subscribe(p => {
      this.form = { medication: p.medication, dosage: p.dosage || '', frequency: p.frequency || '', startDate: p.startDate, endDate: p.endDate || '', notes: p.notes || '', illnessId: p.illnessId || '' };
    });
  }

  onSubmit() {
    if (!this.form.medication || !this.form.startDate) return;
    this.saving = true;
    const obs = this.isEdit ? this.prescriptionService.updatePrescription(this.id, this.form) : this.prescriptionService.createPrescription(this.form);
    obs.subscribe({ next: () => this.router.navigate(['/prescriptions']), error: () => this.saving = false });
  }

  cancel() { this.router.navigate(['/prescriptions']); }

  delete() {
    if (confirm('Delete this prescription?')) {
      this.prescriptionService.deletePrescription(this.id).subscribe(() => this.router.navigate(['/prescriptions']));
    }
  }
}
