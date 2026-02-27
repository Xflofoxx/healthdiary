import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header">
      <h1>Appointments</h1>
      <a routerLink="/appointments/new" class="btn btn-primary">Add Appointment</a>
    </div>

    @if (loading) { <div class="loading">Loading...</div> }
    @else if (appointments.length === 0) {
      <div class="empty-state">
        <p>No appointments scheduled</p>
        <a routerLink="/appointments/new" class="btn btn-secondary">Schedule your first appointment</a>
      </div>
    } @else {
      <table class="data-table">
        <thead><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Specialty</th><th>Location</th><th>Actions</th></tr></thead>
        <tbody>
          @for (apt of appointments; track apt.id) {
            <tr>
              <td><a [routerLink]="['/appointments', apt.id]">{{ apt.date }}</a></td>
              <td>{{ apt.time || '-' }}</td>
              <td>{{ apt.doctorName }}</td>
              <td>{{ apt.specialty || '-' }}</td>
              <td>{{ apt.location || '-' }}</td>
              <td class="actions">
                <a [routerLink]="['/appointments', apt.id]" class="btn-icon">Edit</a>
                <button (click)="deleteAppointment(apt.id)" class="btn-icon btn-danger">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; }
    .actions { display: flex; gap: 0.5rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 500; cursor: pointer; border: none; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #e2e8f0; color: #1e293b; }
    .btn-icon { padding: 0.25rem 0.5rem; background: #f1f5f9; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; color: #475569; font-size: 0.875rem; }
    .btn-danger { background: #fee2e2; color: #dc2626; }
    .empty-state { text-align: center; padding: 3rem; }
    .loading { text-align: center; padding: 2rem; color: #64748b; }
  `]
})
export class AppointmentListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  appointments: Appointment[] = [];
  loading = false;

  ngOnInit() { this.loadAppointments(); }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getAppointments().subscribe({ next: (res) => { this.appointments = res.appointments; this.loading = false; }, error: () => { this.loading = false; } });
  }

  deleteAppointment(id: string) {
    if (confirm('Delete this appointment?')) {
      this.appointmentService.deleteAppointment(id).subscribe(() => this.loadAppointments());
    }
  }
}
