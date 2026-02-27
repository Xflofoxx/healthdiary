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
    <div class="header"><h1>{{ isEdit ? 'Edit Appointment' : 'Add Appointment' }}</h1></div>
    <form (ngSubmit)="onSubmit()" class="form">
      <div class="form-group">
        <label>Doctor Name *</label>
        <input type="text" [(ngModel)]="form.doctorName" name="doctorName" required class="form-control">
      </div>
      <div class="form-group">
        <label>Specialty</label>
        <input type="text" [(ngModel)]="form.specialty" name="specialty" class="form-control">
      </div>
      <div class="form-group">
        <label>Date *</label>
        <input type="date" [(ngModel)]="form.date" name="date" required class="form-control">
      </div>
      <div class="form-group">
        <label>Time</label>
        <input type="time" [(ngModel)]="form.time" name="time" class="form-control">
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" [(ngModel)]="form.location" name="location" class="form-control">
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
export class AppointmentFormComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private illnessService = inject(IllnessService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false; saving = false; id = '';
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
    if (confirm('Delete this appointment?')) {
      this.appointmentService.deleteAppointment(this.id).subscribe(() => this.router.navigate(['/appointments']));
    }
  }
}
