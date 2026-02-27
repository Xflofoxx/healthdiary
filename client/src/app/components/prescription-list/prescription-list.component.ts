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
    <div class="header">
      <h1>Prescriptions</h1>
      <a routerLink="/prescriptions/new" class="btn btn-primary">Add Prescription</a>
    </div>

    <div class="filters">
      <input 
        type="text" 
        placeholder="Search medications..." 
        [(ngModel)]="searchTerm"
        (input)="loadPrescriptions()"
        class="search-input"
      >
    </div>

    @if (loading) {
      <div class="loading">Loading...</div>
    } @else if (prescriptions.length === 0) {
      <div class="empty-state">
        <p>No prescriptions recorded yet</p>
        <a routerLink="/prescriptions/new" class="btn btn-secondary">Add your first prescription</a>
      </div>
    } @else {
      <table class="data-table">
        <thead>
          <tr>
            <th>Medication</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Start Date</th>
            <th>Illness</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (prescription of prescriptions; track prescription.id) {
            <tr>
              <td>
                <a [routerLink]="['/prescriptions', prescription.id]">{{ prescription.medication }}</a>
              </td>
              <td>{{ prescription.dosage || '-' }}</td>
              <td>{{ prescription.frequency || '-' }}</td>
              <td>{{ prescription.startDate }}</td>
              <td>{{ prescription.illnessName || '-' }}</td>
              <td class="actions">
                <a [routerLink]="['/prescriptions', prescription.id]" class="btn-icon">Edit</a>
                <button (click)="deletePrescription(prescription.id)" class="btn-icon btn-danger">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .search-input { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 6px; width: 100%; max-width: 300px; }
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
export class PrescriptionListComponent implements OnInit {
  private prescriptionService = inject(PrescriptionService);
  
  prescriptions: Prescription[] = [];
  loading = false;
  searchTerm = '';

  ngOnInit() { this.loadPrescriptions(); }

  loadPrescriptions() {
    this.loading = true;
    this.prescriptionService.getPrescriptions(undefined, this.searchTerm || undefined)
      .subscribe({ next: (res) => { this.prescriptions = res.prescriptions; this.loading = false; }, error: () => { this.loading = false; } });
  }

  deletePrescription(id: string) {
    if (confirm('Are you sure you want to delete this prescription?')) {
      this.prescriptionService.deletePrescription(id).subscribe(() => this.loadPrescriptions());
    }
  }
}
