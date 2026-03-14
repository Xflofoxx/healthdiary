import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PrescriptionService } from '../../services/prescription.service';
import { Prescription } from '../../models/prescription.model';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-pills"></i> Farmaci</h1>
          <p>Gestisci le tue prescrizioni mediche</p>
        </div>
        <a routerLink="/prescriptions/new" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuovo Farmaco
        </a>
      </header>

      <div class="filters">
        <input 
          type="text" 
          placeholder="Cerca farmaci..." 
          [(ngModel)]="searchTerm"
          (input)="loadPrescriptions()"
          class="form-control search-input"
        >
      </div>

      @if (loading) {
        <div class="loading"><i class="fas fa-spinner fa-spin"></i> Caricamento...</div>
      } @else if (prescriptions.length === 0) {
        <div class="empty-state">
          <i class="fas fa-pills"></i>
          <h2>Nessun farmaco registrato</h2>
          <p>Aggiungi le tue prescrizioni mediche</p>
          <a routerLink="/prescriptions/new" class="btn btn-primary">
            <i class="fas fa-plus"></i> Aggiungi Farmaco
          </a>
        </div>
      } @else {
        <div class="cards-grid">
          @for (rx of prescriptions; track rx.id) {
            <div class="prescription-card">
              <div class="card-header">
                <div class="card-icon">
                  <i class="fas fa-pills"></i>
                </div>
                <span class="status-badge" [class]="getStatusClass(rx)">
                  {{ getStatusLabel(rx) }}
                </span>
              </div>
              <div class="card-body">
                <h3>{{ rx.medication }}</h3>
                <div class="prescription-details">
                  @if (rx.dosage) {
                    <span><i class="fas fa-weight"></i> {{ rx.dosage }}</span>
                  }
                  @if (rx.frequency) {
                    <span><i class="fas fa-clock"></i> {{ rx.frequency }}</span>
                  }
                </div>
                @if (rx.illnessName) {
                  <div class="linked-item">
                    <i class="fas fa-user-injured"></i> {{ rx.illnessName }}
                  </div>
                }
                @if ((rx as any).doctorName) {
                  <div class="linked-item">
                    <i class="fas fa-user-md"></i> {{ (rx as any).doctorName }}
                  </div>
                }
                <div class="card-dates">
                  <span><i class="fas fa-calendar-start"></i> Dal: {{ formatDate(rx.startDate) }}</span>
                  @if (rx.endDate) {
                    <span><i class="fas fa-calendar-end"></i> Al: {{ formatDate(rx.endDate) }}</span>
                  }
                </div>
              </div>
              <div class="card-actions">
                <a [routerLink]="['/prescriptions', rx.id]" class="btn-icon" title="Modifica">
                  <i class="fas fa-edit"></i>
                </a>
                <button (click)="deletePrescription(rx.id)" class="btn-icon danger" title="Elimina">
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
    .filters { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 200px; max-width: 400px; }
    .loading { text-align: center; padding: 3rem; color: var(--text-muted); }
    .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 16px; }
    .empty-state i { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1rem; }
    .empty-state h2 { color: var(--text-primary); margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-muted); margin-bottom: 1.5rem; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .prescription-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
    .prescription-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: var(--bg-secondary); }
    .card-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: #dbeafe; color: #2563eb; }
    .card-body { padding: 1.25rem; }
    .card-body h3 { color: var(--text-primary); margin: 0 0 0.75rem; }
    .prescription-details { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.75rem; }
    .prescription-details span { font-size: 0.9rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.4rem; }
    .linked-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--primary-color); margin-bottom: 0.5rem; }
    .card-dates { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; color: var(--text-muted); }
    .card-dates i { margin-right: 0.5rem; width: 14px; }
    .card-actions { display: flex; gap: 0.5rem; padding: 0.75rem 1.25rem; border-top: 1px solid var(--border-color); }
    .btn-icon { width: 36px; height: 36px; border: none; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon:hover { background: var(--primary-color); color: white; }
    .btn-icon.danger:hover { background: var(--danger); }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .status-active { background: #dbeafe; color: #2563eb; }
    .status-completed { background: #d1fae5; color: #059669; }
    .status-pending { background: #fef3c7; color: #d97706; }
  `]
})
export class PrescriptionListComponent implements OnInit {
  private prescriptionService = inject(PrescriptionService);
  
  prescriptions: Prescription[] = [];
  loading = false;
  searchTerm = '';

  ngOnInit() { this.loadPrescriptions(); }

  loadPrescriptions() {
    this.loading = true;
    this.prescriptionService.getPrescriptions(undefined, this.searchTerm || undefined)
      .subscribe({ 
        next: (res) => { 
          this.prescriptions = res.prescriptions; 
          this.loading = false; 
        }, 
        error: () => { 
          this.loading = false; 
        } 
      });
  }

  deletePrescription(id: string) {
    if (confirm('Sei sicuro di voler eliminare questa prescrizione?')) {
      this.prescriptionService.deletePrescription(id).subscribe(() => this.loadPrescriptions());
    }
  }

  getStatusClass(rx: Prescription): string {
    if (!rx.endDate) return 'status-active';
    const endDate = new Date(rx.endDate);
    const today = new Date();
    return endDate >= today ? 'status-active' : 'status-completed';
  }

  getStatusLabel(rx: Prescription): string {
    if (!rx.endDate) return 'In corso';
    const endDate = new Date(rx.endDate);
    const today = new Date();
    return endDate >= today ? 'In corso' : 'Completato';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('it-IT');
  }
}
