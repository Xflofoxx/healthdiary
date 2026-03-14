import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HealthService, Prescription, Appointment } from '../../services/health.service';

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  prescriptions: Prescription[];
  appointments: Appointment[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-calendar-alt"></i> Calendario</h1>
          <p>Visualizza prescrizioni e appuntamenti</p>
        </div>
        <div class="view-toggle">
          <button (click)="previousMonth()" class="btn-icon"><i class="fas fa-chevron-left"></i></button>
          <span class="current-month">{{ currentMonthName }} {{ currentYear }}</span>
          <button (click)="nextMonth()" class="btn-icon"><i class="fas fa-chevron-right"></i></button>
        </div>
      </header>

      <div class="calendar-grid">
        <div class="weekday" *ngFor="let day of weekdays">{{ day }}</div>
        <div *ngFor="let day of calendarDays" 
             class="calendar-day" 
             [class.other-month]="!day.isCurrentMonth"
             [class.today]="day.isToday"
             [class.has-events]="day.prescriptions.length > 0 || day.appointments.length > 0">
          <span class="day-number">{{ day.day }}</span>
          <div class="day-events">
            @for (rx of day.prescriptions.slice(0, 2); track rx.id) {
              <div class="event prescription" [title]="rx.medication">
                <i class="fas fa-pills"></i> {{ rx.medication }}
              </div>
            }
            @for (apt of day.appointments.slice(0, 2); track apt.id) {
              <div class="event appointment" [title]="apt.doctorName">
                <i class="fas fa-user-md"></i> {{ apt.doctorName }}
              </div>
            }
            @if (day.prescriptions.length + day.appointments.length > 2) {
              <div class="more-events">+{{ day.prescriptions.length + day.appointments.length - 2 }}</div>
            }
          </div>
        </div>
      </div>

      <section class="upcoming-section">
        <h2><i class="fas fa-clock"></i> Prossimi Eventi</h2>
        <div class="upcoming-list">
          @for (event of upcomingEvents; track event.id + event.date) {
            <div class="upcoming-card" [class]="event.type">
              <div class="event-date">
                <span class="day">{{ formatDay(event.date) }}</span>
                <span class="month">{{ formatMonth(event.date) }}</span>
              </div>
              <div class="event-details">
                @if (event.type === 'prescription') {
                  <strong><i class="fas fa-pills"></i> {{ event.title }}</strong>
                  <span>{{ event.details }}</span>
                } @else {
                  <strong><i class="fas fa-user-md"></i> {{ event.title }}</strong>
                  <span>{{ event.time || '' }} - {{ event.details }}</span>
                }
              </div>
              <a [routerLink]="[event.link]" class="btn-icon"><i class="fas fa-arrow-right"></i></a>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .header-content h1 { color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem; }
    .header-content p { color: var(--text-muted); margin-top: 0.25rem; }
    .view-toggle { display: flex; align-items: center; gap: 1rem; }
    .current-month { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); min-width: 180px; text-align: center; }
    .btn-icon { width: 36px; height: 36px; border: none; background: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .btn-icon:hover { background: var(--primary-color); color: white; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; background: white; padding: 1rem; border-radius: 16px; margin-bottom: 2rem; }
    .weekday { text-align: center; font-weight: 600; color: var(--text-muted); padding: 0.5rem; font-size: 0.875rem; }
    .calendar-day { min-height: 100px; padding: 0.5rem; border-radius: 8px; background: #f8fafc; }
    .calendar-day.other-month { background: #f1f5f9; opacity: 0.6; }
    .calendar-day.today { background: #e0e7ff; }
    .calendar-day.today .day-number { background: var(--primary-color); color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
    .day-number { font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; }
    .day-events { font-size: 0.7rem; display: flex; flex-direction: column; gap: 2px; }
    .event { padding: 2px 4px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .event.prescription { background: #dbeafe; color: #2563eb; }
    .event.appointment { background: #d1fae5; color: #059669; }
    .more-events { font-size: 0.7rem; color: var(--text-muted); }
    .upcoming-section h2 { color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .upcoming-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .upcoming-card { display: flex; align-items: center; gap: 1rem; background: white; padding: 1rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .upcoming-card.prescription { border-left: 4px solid #2563eb; }
    .upcoming-card.appointment { border-left: 4px solid #059669; }
    .event-date { text-align: center; min-width: 50px; }
    .event-date .day { display: block; font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    .event-date .month { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
    .event-details { flex: 1; }
    .event-details strong { display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); }
    .event-details span { font-size: 0.875rem; color: var(--text-muted); }
  `]
})
export class CalendarComponent implements OnInit {
  private healthService = inject(HealthService);

  weekdays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  upcomingEvents: { id: string; type: string; title: string; date: string; time?: string; details: string; link: string }[] = [];

  get currentMonthName(): string {
    return this.currentDate.toLocaleString('it-IT', { month: 'long' });
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    this.calendarDays = [];
    const current = new Date(startDate);
    const today = new Date().toISOString().split('T')[0];

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      this.calendarDays.push({
        date: dateStr,
        day: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        isToday: dateStr === today,
        prescriptions: [],
        appointments: []
      });
      current.setDate(current.getDate() + 1);
    }

    this.healthService.getPrescriptions().subscribe({
      next: (res) => {
        res.prescriptions.forEach(rx => {
          const day = this.calendarDays.find(d => d.date === rx.startDate);
          if (day) day.prescriptions.push(rx);
        });
      }
    });

    this.healthService.getAppointments().subscribe({
      next: (res) => {
        res.appointments.forEach(apt => {
          const day = this.calendarDays.find(d => d.date === apt.date);
          if (day) day.appointments.push(apt);
        });
        this.loadUpcomingEvents();
      }
    });
  }

  loadUpcomingEvents() {
    const today = new Date().toISOString().split('T')[0];
    this.upcomingEvents = [];
    
    this.calendarDays.forEach(day => {
      if (day.date >= today) {
        day.prescriptions.forEach(rx => {
          this.upcomingEvents.push({
            id: rx.id,
            type: 'prescription',
            title: rx.medication,
            date: rx.startDate,
            details: `${rx.dosage || ''} - ${rx.frequency || ''}`.trim(),
            link: `/prescriptions/${rx.id}`
          });
        });
        day.appointments.forEach(apt => {
          this.upcomingEvents.push({
            id: apt.id,
            type: 'appointment',
            title: apt.doctorName,
            date: apt.date,
            time: apt.time || undefined,
            details: apt.specialty || 'Visita',
            link: `/appointments/${apt.id}`
          });
        });
      }
    });

    this.upcomingEvents.sort((a, b) => a.date.localeCompare(b.date));
    this.upcomingEvents = this.upcomingEvents.slice(0, 10);
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.loadData();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.loadData();
  }

  formatDay(date: string): string {
    return new Date(date).getDate().toString();
  }

  formatMonth(date: string): string {
    return new Date(date).toLocaleString('it-IT', { month: 'short' });
  }
}
