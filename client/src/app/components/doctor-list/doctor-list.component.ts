import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HealthService, Doctor } from '../../services/health.service';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-user-md"></i> Rubrica Medici</h1>
          <p>Gestisci i tuoi medici e contatti</p>
        </div>
        <a routerLink="/doctors/new" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuovo Medico
        </a>
      </header>

      @if (doctors.length === 0) {
        <div class="empty-state">
          <i class="fas fa-user-md"></i>
          <h2>Nessun medico registrato</h2>
          <p>Aggiungi il tuo primo medico</p>
          <a routerLink="/doctors/new" class="btn btn-primary">
            <i class="fas fa-plus"></i> Aggiungi Medico
          </a>
        </div>
      } @else {
        <div class="doctors-grid">
          @for (doctor of doctors; track doctor.id) {
            <div class="doctor-card">
              <div class="doctor-avatar">
                <i class="fas fa-user-md"></i>
              </div>
              <div class="doctor-info">
                <h3>{{ doctor.name }}</h3>
                @if (doctor.specialty) {
                  <span class="specialty">{{ doctor.specialty }}</span>
                }
                <div class="contact-info">
                  @if (doctor.phone) {
                    <span><i class="fas fa-phone"></i> {{ doctor.phone }}</span>
                  }
                  @if (doctor.email) {
                    <span><i class="fas fa-envelope"></i> {{ doctor.email }}</span>
                  }
                  @if (doctor.address) {
                    <span><i class="fas fa-map-marker-alt"></i> {{ doctor.address }}</span>
                  }
                </div>
              </div>
              <div class="doctor-actions">
                <a [routerLink]="['/doctors', doctor.id]" class="btn-icon" title="Modifica">
                  <i class="fas fa-edit"></i>
                </a>
                <button (click)="deleteDoctor(doctor.id)" class="btn-icon danger" title="Elimina">
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
    .page-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header-content h1 { color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem; }
    .header-content p { color: var(--text-muted); margin-top: 0.25rem; }
    .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 16px; }
    .empty-state i { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1rem; }
    .empty-state h2 { color: var(--text-primary); margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-muted); margin-bottom: 1.5rem; }
    .doctors-grid { display: grid; gap: 1rem; }
    .doctor-card { display: flex; align-items: center; gap: 1rem; background: white; padding: 1.25rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .doctor-avatar { width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; }
    .doctor-info { flex: 1; }
    .doctor-info h3 { color: var(--text-primary); margin: 0; }
    .specialty { background: #f3f4f6; color: var(--primary-color); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
    .contact-info { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-muted); }
    .contact-info i { margin-right: 0.25rem; }
    .doctor-actions { display: flex; gap: 0.5rem; }
    .btn-icon { width: 36px; height: 36px; border: none; background: #f3f4f6; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon:hover { background: var(--primary-color); color: white; }
    .btn-icon.danger:hover { background: #dc2626; }
  `]
})
export class DoctorListComponent implements OnInit {
  private healthService = inject(HealthService);
  doctors: Doctor[] = [];

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.healthService.getDoctors().subscribe({
      next: (res) => this.doctors = res.doctors,
      error: () => this.doctors = []
    });
  }

  deleteDoctor(id: string) {
    if (confirm('Sei sicuro di voler eliminare questo medico?')) {
      this.healthService.deleteDoctor(id).subscribe({
        next: () => this.loadDoctors()
      });
    }
  }
}
