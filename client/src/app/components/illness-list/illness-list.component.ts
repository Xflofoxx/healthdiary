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
    <div class="header">
      <h1>Illnesses</h1>
      <a routerLink="/illnesses/new" class="btn btn-primary">Add Illness</a>
    </div>

    <div class="filters">
      <input 
        type="text" 
        placeholder="Search illnesses..." 
        [(ngModel)]="searchTerm"
        (input)="loadIllnesses()"
        class="search-input"
      >
      <select [(ngModel)]="statusFilter" (change)="loadIllnesses()" class="status-select">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="resolved">Resolved</option>
        <option value="chronic">Chronic</option>
      </select>
    </div>

    @if (loading) {
      <div class="loading">Loading...</div>
    } @else if (illnesses.length === 0) {
      <div class="empty-state">
        <p>No illnesses recorded yet</p>
        <a routerLink="/illnesses/new" class="btn btn-secondary">Add your first illness</a>
      </div>
    } @else {
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (illness of illnesses; track illness.id) {
            <tr>
              <td>
                <a [routerLink]="['/illnesses', illness.id]">{{ illness.name }}</a>
              </td>
              <td>{{ illness.startDate }}</td>
              <td>{{ illness.endDate || '-' }}</td>
              <td>
                <span class="status-badge" [class]="illness.status">
                  {{ illness.status }}
                </span>
              </td>
              <td class="actions">
                <a [routerLink]="['/illnesses', illness.id]" class="btn-icon">Edit</a>
                <button (click)="deleteIllness(illness.id)" class="btn-icon btn-danger">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .header h1 { margin: 0; }
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .search-input, .status-select {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
    }
    .search-input { flex: 1; max-width: 300px; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .data-table th, .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table th {
      background: #f8fafc;
      font-weight: 600;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.875rem;
      text-transform: capitalize;
    }
    .status-badge.active { background: #dbeafe; color: #1d4ed8; }
    .status-badge.resolved { background: #d1fae5; color: #059669; }
    .status-badge.chronic { background: #fed7aa; color: #ea580c; }
    .actions { display: flex; gap: 0.5rem; }
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #e2e8f0; color: #1e293b; }
    .btn-icon {
      padding: 0.25rem 0.5rem;
      background: #f1f5f9;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      color: #475569;
      font-size: 0.875rem;
    }
    .btn-danger { background: #fee2e2; color: #dc2626; }
    .empty-state { text-align: center; padding: 3rem; }
    .loading { text-align: center; padding: 2rem; color: #64748b; }
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
    if (confirm('Are you sure you want to delete this illness?')) {
      this.illnessService.deleteIllness(id).subscribe(() => {
        this.loadIllnesses();
      });
    }
  }
}
