import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IllnessService } from '../../services/illness.service';
import { Illness } from '../../models/illness.model';

@Component({
  selector: 'app-illness-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-user-injured"></i> Malattie</h1>
          <p>Gestisci le tue malattie e condizioni di salute</p>
        </div>
        <a routerLink="/illnesses/new" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuova Malattia
        </a>
      </header>

      <div class="filters">
        <input 
          type="text" 
          placeholder="Cerca malattie..." 
          [(ngModel)]="searchTerm"
          (input)="loadIllnesses()"
          class="form-control search-input"
        >
        <select [(ngModel)]="statusFilter" (change)="loadIllnesses()" class="form-control status-select">
          <option value="">Tutti gli stati</option>
          <option value="active">Attiva</option>
          <option value="resolved">Risolta</option>
          <option value="chronic">Cronica</option>
        </select>
      </div>

      @if (loading) {
        <div class="loading"><i class="fas fa-spinner fa-spin"></i> Caricamento...</div>
      } @else if (illnesses.length === 0) {
        <div class="empty-state">
          <i class="fas fa-user-injured"></i>
          <h2>Nessuna malattia registrata</h2>
          <p>Inizia a tracciare la tua salute</p>
          <a routerLink="/illnesses/new" class="btn btn-primary">
            <i class="fas fa-plus"></i> Aggiungi Malattia
          </a>
        </div>
      } @else {
        <div class="cards-grid">
          @for (illness of illnesses; track illness.id) {
            <div class="illness-card">
              <div class="card-header">
                <div class="card-icon" [class]="illness.status">
                  <i class="fas fa-user-injured"></i>
                </div>
                <span class="status-badge" [class]="illness.status">
                  {{ getStatusLabel(illness.status) }}
                </span>
              </div>
              <div class="card-body">
                <h3>{{ illness.name }}</h3>
                @if (illness.notes) {
                  <p class="notes">{{ illness.notes }}</p>
                }
                <div class="card-dates">
                  <span><i class="fas fa-calendar-start"></i> Inizio: {{ formatDate(illness.startDate) }}</span>
                  @if (illness.endDate) {
                    <span><i class="fas fa-calendar-end"></i> Fine: {{ formatDate(illness.endDate) }}</span>
                  }
                </div>
              </div>
              <div class="card-actions">
                <a [routerLink]="['/illnesses', illness.id]" class="btn-icon" title="Modifica">
                  <i class="fas fa-edit"></i>
                </a>
                <button (click)="deleteIllness(illness.id)" class="btn-icon danger" title="Elimina">
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
    .status-select { width: 180px; }
    .loading { text-align: center; padding: 3rem; color: var(--text-muted); }
    .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 16px; }
    .empty-state i { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1rem; }
    .empty-state h2 { color: var(--text-primary); margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-muted); margin-bottom: 1.5rem; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .illness-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
    .illness-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: var(--bg-secondary); }
    .card-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .card-icon.active { background: #fef3c7; color: #d97706; }
    .card-icon.resolved { background: #d1fae5; color: #059669; }
    .card-icon.chronic { background: #fed7aa; color: #ea580c; }
    .card-body { padding: 1.25rem; }
    .card-body h3 { color: var(--text-primary); margin: 0 0 0.5rem; }
    .notes { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; }
    .card-dates { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; color: var(--text-muted); }
    .card-dates i { margin-right: 0.5rem; width: 14px; }
    .card-actions { display: flex; gap: 0.5rem; padding: 0.75rem 1.25rem; border-top: 1px solid var(--border-color); }
    .btn-icon { width: 36px; height: 36px; border: none; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon:hover { background: var(--primary-color); color: white; }
    .btn-icon.danger:hover { background: var(--danger); }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.active { background: #fef3c7; color: #d97706; }
    .status-badge.resolved { background: #d1fae5; color: #059669; }
    .status-badge.chronic { background: #fed7aa; color: #ea580c; }
  `]
})
export class IllnessListComponent implements OnInit {
  private illnessService = inject(IllnessService);
  
  illnesses: Illness[] = [];
  loading = false;
  searchTerm = '';
  statusFilter = '';

  ngOnInit() {
    this.loadIllnesses();
  }

  loadIllnesses() {
    this.loading = true;
    this.illnessService.getIllnesses(this.searchTerm || undefined, this.statusFilter || undefined)
      .subscribe({
        next: (res) => {
          this.illnesses = res.illnesses;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  deleteIllness(id: string) {
    if (confirm('Sei sicuro di voler eliminare questa malattia?')) {
      this.illnessService.deleteIllness(id).subscribe(() => {
        this.loadIllnesses();
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Attiva',
      'resolved': 'Risolta',
      'chronic': 'Cronica'
    };
    return labels[status] || status;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('it-IT');
  }
}
