import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HealthService } from '../../services/health.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>
          <i class="fas fa-heartbeat"></i>
          Benvenuto, {{ userName }}
        </h1>
        <p class="subtitle">Ecco la panoramica della tua salute</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon illnesses">
            <i class="fas fa-user-injured"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.illnesses }}</span>
            <span class="stat-label">Malattie Attive</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon prescriptions">
            <i class="fas fa-pills"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.prescriptions }}</span>
            <span class="stat-label">Prescrizioni</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon appointments">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.appointments }}</span>
            <span class="stat-label">Appuntamenti</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.pendingPrescriptions }}</span>
            <span class="stat-label">Da Prendere Oggi</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <section class="card chart-card">
          <h2><i class="fas fa-chart-pie"></i> Stato Malattie</h2>
          <div class="chart-container">
            <div class="pie-chart">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="circle active"
                  [style.strokeDasharray]="activePercent + ', 100'"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="circle recovered"
                  [style.strokeDasharray]="recoveredPercent + ', 100'"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="chart-center">
                <span class="total">{{ stats.illnesses }}</span>
                <span class="label">Totale</span>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color active"></span>
                <span>Attive: {{ activeIllnesses }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-color recovered"></span>
                <span>Recuperate: {{ recoveredIllnesses }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="card upcoming-card">
          <h2><i class="fas fa-calendar-alt"></i> Prossimi Appuntamenti</h2>
          @if (upcomingAppointments.length === 0) {
            <p class="empty-state">Nessun appuntamento programmato</p>
          } @else {
            <ul class="upcoming-list">
              @for (apt of upcomingAppointments; track apt.id) {
                <li class="upcoming-item">
                  <div class="upcoming-date">
                    <span class="day">{{ apt.date | date:'dd' }}</span>
                    <span class="month">{{ apt.date | date:'MMM' }}</span>
                  </div>
                  <div class="upcoming-details">
                    <strong>{{ apt.doctorName }}</strong>
                    <span>{{ apt.specialty || 'Generale' }}</span>
                  </div>
                </li>
              }
            </ul>
          }
          <a routerLink="/appointments/new" class="btn-add">
            <i class="fas fa-plus"></i> Nuovo Appuntamento
          </a>
        </section>

        <section class="card prescriptions-card">
          <h2><i class="fas fa-pills"></i> Farmaci da Prendere</h2>
          @if (todayPrescriptions.length === 0) {
            <p class="empty-state">Nessun farmaco per oggi</p>
          } @else {
            <ul class="prescription-list">
              @for (rx of todayPrescriptions; track rx.id) {
                <li class="prescription-item">
                  <div class="rx-icon">
                    <i class="fas fa-pill"></i>
                  </div>
                  <div class="rx-details">
                    <strong>{{ rx.medication }}</strong>
                    <span>{{ rx.dosage }} - {{ rx.frequency }}</span>
                  </div>
                </li>
              }
            </ul>
          }
          <a routerLink="/prescriptions/new" class="btn-add">
            <i class="fas fa-plus"></i> Nuova Prescrizione
          </a>
        </section>

        <section class="card recent-card">
          <h2><i class="fas fa-history"></i> Malattie Recenti</h2>
          @if (recentIllnesses.length === 0) {
            <p class="empty-state">Nessuna malattia registrata</p>
          } @else {
            <ul class="recent-list">
              @for (illness of recentIllnesses; track illness.id) {
                <li class="recent-item">
                  <div class="recent-icon" [class]="illness.status">
                    <i class="fas" [class.fa-user-injured]="illness.status === 'active'" [class.fa-check]="illness.status !== 'active'"></i>
                  </div>
                  <div class="recent-details">
                    <strong>{{ illness.name }}</strong>
                    <span>Iniziata: {{ illness.startDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <span class="status-badge" [class]="illness.status">
                    {{ illness.status === 'active' ? 'Attiva' : 'Recuperata' }}
                  </span>
                </li>
              }
            </ul>
          }
          <a routerLink="/illnesses/new" class="btn-add">
            <i class="fas fa-plus"></i> Nuova Malattia
          </a>
        </section>
      </div>

      <section class="quick-actions">
        <h2><i class="fas fa-bolt"></i> Azioni Rapide</h2>
        <div class="actions-grid">
          <a routerLink="/illnesses/new" class="action-btn">
            <i class="fas fa-user-injured"></i>
            <span>Nuova Malattia</span>
          </a>
          <a routerLink="/prescriptions/new" class="action-btn">
            <i class="fas fa-prescription"></i>
            <span>Nuova Prescrizione</span>
          </a>
          <a routerLink="/appointments/new" class="action-btn">
            <i class="fas fa-calendar-plus"></i>
            <span>Nuovo Appuntamento</span>
          </a>
          <a routerLink="/settings" class="action-btn">
            <i class="fas fa-cog"></i>
            <span>Impostazioni</span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: var(--primary-color);
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .dashboard-header h1 i {
      color: var(--accent-color);
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin-top: 0.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-icon.illnesses { background: #fef3c7; color: #d97706; }
    .stat-icon.prescriptions { background: #dbeafe; color: #2563eb; }
    .stat-icon.appointments { background: #d1fae5; color: #059669; }
    .stat-icon.pending { background: #fee2e2; color: #dc2626; }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-label {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .card h2 {
      font-size: 1.1rem;
      color: var(--text-primary);
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card h2 i {
      color: var(--primary-color);
    }

    .empty-state {
      color: var(--text-muted);
      text-align: center;
      padding: 2rem;
      font-style: italic;
    }

    .chart-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .pie-chart {
      position: relative;
      width: 160px;
      height: 160px;
    }

    .circular-chart {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .circle-bg {
      fill: none;
      stroke: #e5e7eb;
      stroke-width: 3;
    }

    .circle {
      fill: none;
      stroke-width: 3;
      stroke-linecap: round;
      animation: progress 1s ease-out forwards;
    }

    .circle.active { stroke: #d97706; }
    .circle.recovered { stroke: #059669; }

    .chart-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .chart-center .total {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .chart-center .label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .chart-legend {
      display: flex;
      gap: 1.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .legend-color.active { background: #d97706; }
    .legend-color.recovered { background: #059669; }

    .upcoming-list, .prescription-list, .recent-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .upcoming-item, .prescription-item, .recent-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .upcoming-item:last-child, .prescription-item:last-child, .recent-item:last-child {
      border-bottom: none;
    }

    .upcoming-date {
      width: 48px;
      height: 48px;
      background: var(--primary-color);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .upcoming-date .day {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1;
    }

    .upcoming-date .month {
      font-size: 0.625rem;
      text-transform: uppercase;
    }

    .upcoming-details, .rx-details, .recent-details {
      display: flex;
      flex-direction: column;
    }

    .upcoming-details strong, .rx-details strong, .recent-details strong {
      color: var(--text-primary);
    }

    .upcoming-details span, .rx-details span, .recent-details span {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .rx-icon {
      width: 40px;
      height: 40px;
      background: #dbeafe;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2563eb;
    }

    .recent-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .recent-icon.active { background: #fef3c7; color: #d97706; }
    .recent-icon.recovered { background: #d1fae5; color: #059669; }

    .status-badge {
      margin-left: auto;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.active { background: #fef3c7; color: #d97706; }
    .status-badge.recovered { background: #d1fae5; color: #059669; }

    .btn-add {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem;
      margin-top: 1rem;
      background: #f3f4f6;
      color: var(--text-secondary);
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-add:hover {
      background: var(--primary-color);
      color: white;
    }

    .quick-actions {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .quick-actions h2 {
      font-size: 1.1rem;
      color: var(--text-primary);
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quick-actions h2 i {
      color: var(--accent-color);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.25rem;
      background: #f8fafc;
      border-radius: 12px;
      text-decoration: none;
      color: var(--text-secondary);
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: var(--primary-color);
      color: white;
      transform: translateY(-2px);
    }

    .action-btn i {
      font-size: 1.5rem;
    }

    @keyframes progress {
      0% { stroke-dasharray: 0, 100; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private healthService = inject(HealthService);

  userName = '';
  
  stats = {
    illnesses: 0,
    prescriptions: 0,
    appointments: 0,
    pendingPrescriptions: 0
  };

  activeIllnesses = 0;
  recoveredIllnesses = 0;
  activePercent = 0;
  recoveredPercent = 0;

  upcomingAppointments: { id: string; doctorName: string; specialty: string | null; date: string }[] = [];
  todayPrescriptions: { id: string; medication: string; dosage: string | null; frequency: string | null }[] = [];
  recentIllnesses: { id: string; name: string; startDate: string; status: string }[] = [];

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.displayName || user.username;
      }
    });

    this.loadDashboardData();
  }

  loadDashboardData() {
    this.healthService.getIllnesses().subscribe(data => {
      this.stats.illnesses = data.total;
      const illnesses = data.illnesses;
      this.activeIllnesses = illnesses.filter((i: any) => i.status === 'active').length;
      this.recoveredIllnesses = illnesses.filter((i: any) => i.status !== 'active').length;
      
      const total = this.stats.illnesses || 1;
      this.activePercent = (this.activeIllnesses / total) * 100;
      this.recoveredPercent = (this.recoveredIllnesses / total) * 100;
      
      this.recentIllnesses = illnesses.slice(0, 3);
    });

    this.healthService.getPrescriptions().subscribe(data => {
      this.stats.prescriptions = data.total;
      const today = new Date().toISOString().split('T')[0];
      this.todayPrescriptions = data.prescriptions
        .filter((p: any) => !p.endDate || p.endDate >= today)
        .slice(0, 3);
      this.stats.pendingPrescriptions = this.todayPrescriptions.length;
    });

    this.healthService.getAppointments().subscribe(data => {
      this.stats.appointments = data.total;
      const today = new Date().toISOString().split('T')[0];
      this.upcomingAppointments = data.appointments
        .filter((a: any) => a.date >= today)
        .sort((a: any, b: any) => a.date.localeCompare(b.date))
        .slice(0, 3);
    });
  }
}
