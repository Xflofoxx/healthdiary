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
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-calendar-check"></i> Visite Mediche</h1>
          <p>Gestisci i tuoi appuntamenti medici</p>
        </div>
        <a routerLink="/appointments/new" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuova Visita
        </a>
      </header>

      @if (loading) {
        <div class="loading"><i class="fas fa-spinner fa-spin"></i> Caricamento...</div>
      } @else if (appointments.length === 0) {
        <div class="empty-state">
          <i class="fas fa-calendar-check"></i>
          <h2>Nessuna visita programmata</h2>
          <p>Pianifica la tua prossima visita medica</p>
          <a routerLink="/appointments/new" class="btn btn-primary">
            <i class="fas fa-plus"></i> Aggiungi Visita
          </a>
        </div>
      } @else {
        <div class="cards-grid">
          @for (apt of appointments; track apt.id) {
            <div class="appointment-card" [class.past]="isPast(apt.date)">
              <div class="card-header">
                <div class="date-box">
                  <span class="day">{{ getDay(apt.date) }}</span>
                  <span class="month">{{ getMonth(apt.date) }}</span>
                </div>
                <span class="status-badge" [class]="getStatusClass(apt.date)">
                  {{ getStatusLabel(apt.date) }}
                </span>
              </div>
              <div class="card-body">
                <h3>{{ apt.doctorName }}</h3>
                @if (apt.specialty) {
                  <span class="specialty">{{ apt.specialty }}</span>
                }
                <div class="appointment-details">
                  @if (apt.time) {
                    <span><i class="fas fa-clock"></i> {{ apt.time }}</span>
                  }
                  @if (apt.location) {
                    <span><i class="fas fa-map-marker-alt"></i> {{ apt.location }}</span>
                  }
                </div>
                @if (apt.notes) {
                  <p class="notes">{{ apt.notes }}</p>
                }
              </div>
              <div class="card-actions">
                <a [routerLink]="['/appointments', apt.id]" class="btn-icon" title="Modifica">
                  <i class="fas fa-edit"></i>
                </a>
                <button (click)="deleteAppointment(apt.id)" class="btn-icon danger" title="Elimina">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .header-content h1 { color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem; margin: 0; }
    .header-content p { color: var(--text-muted); margin-top: 0.25rem; }
    .loading { text-align: center; padding: 3rem; color: var(--text-muted); }
    .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 16px; }
    .empty-state i { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1rem; }
    .empty-state h2 { color: var(--text-primary); margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-muted); margin-bottom: 1.5rem; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .appointment-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
    .appointment-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .appointment-card.past { opacity: 0.7; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1rem 1.25rem; background: var(--bg-secondary); }
    .date-box { width: 50px; height: 50px; background: var(--primary-color); border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
    .date-box .day { font-size: 1.25rem; font-weight: 700; line-height: 1; }
    .date-box .month { font-size: 0.65rem; text-transform: uppercase; }
    .card-body { padding: 1.25rem; }
    .card-body h3 { color: var(--text-primary); margin: 0 0 0.25rem; }
    .specialty { background: var(--bg-tertiary); color: var(--primary-color); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
    .appointment-details { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.75rem; font-size: 0.9rem; color: var(--text-muted); }
    .appointment-details i { margin-right: 0.5rem; width: 14px; }
    .notes { margin-top: 0.75rem; font-size: 0.9rem; color: var(--text-secondary); }
    .card-actions { display: flex; gap: 0.5rem; padding: 0.75rem 1.25rem; border-top: 1px solid var(--border-color); }
    .btn-icon { width: 36px; height: 36px; border: none; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon:hover { background: var(--primary-color); color: white; }
    .btn-icon.danger:hover { background: var(--danger); }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .status-upcoming { background: #dbeafe; color: #2563eb; }
    .status-today { background: #fef3c7; color: #d97706; }
    .status-past { background: var(--bg-tertiary); color: var(--text-muted); }
  `]
})
export class AppointmentListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  appointments: Appointment[] = [];
  loading = false;

  ngOnInit() { this.loadAppointments(); }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getAppointments().subscribe({ 
      next: (res) => { 
        this.appointments = res.appointments.sort((a, b) => a.date.localeCompare(b.date));
        this.loading = false; 
      }, 
      error: () => { this.loading = false; } 
    });
  }

  deleteAppointment(id: string) {
    if (confirm('Sei sicuro di voler eliminare questa visita?')) {
      this.appointmentService.deleteAppointment(id).subscribe(() => this.loadAppointments());
    }
  }

  getDay(date: string): string {
    return new Date(date).getDate().toString();
  }

  getMonth(date: string): string {
    return new Date(date).toLocaleString('it-IT', { month: 'short' });
  }

  isPast(date: string): boolean {
    return new Date(date) < new Date();
  }

  getStatusClass(date: string): string {
    const today = new Date();
    const aptDate = new Date(date);
    if (aptDate.toDateString() === today.toDateString()) return 'status-today';
    if (aptDate < today) return 'status-past';
    return 'status-upcoming';
  }

  getStatusLabel(date: string): string {
    const today = new Date();
    const aptDate = new Date(date);
    if (aptDate.toDateString() === today.toDateString()) return 'Oggi';
    if (aptDate < today) return 'Passata';
    return 'Futura';
  }
}
