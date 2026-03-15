import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { COMMON_MEDICATIONS, CommonMedication } from '../../data/common-medications';

@Component({
  selector: 'app-medications-browser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-search"></i> Database Farmaci</h1>
          <p>Cerca tra i farmaci più comuni in Italia</p>
        </div>
      </header>

      <div class="search-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" 
                 [(ngModel)]="searchTerm" 
                 (input)="filterMedications()"
                 placeholder="Cerca per nome, principio attivo o categoria...">
        </div>
        
        <div class="filters">
          <div class="filter-group">
            <label>Categoria:</label>
            <select [(ngModel)]="selectedCategory" (change)="filterMedications()">
              <option value="">Tutte</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>
          <div class="results-count">
            {{ filteredMedications.length }} farmaci trovati
          </div>
        </div>
      </div>

      <div class="medications-grid">
        @for (med of filteredMedications; track med.id) {
          <div class="medication-card" [class.selected]="selectedMedication?.id === med.id" (click)="selectMedication(med)">
            <div class="med-header">
              <h3>{{ med.name }}</h3>
              <span class="category-badge">{{ med.category }}</span>
            </div>
            <div class="med-body">
              <div class="med-detail">
                <i class="fas fa-flask"></i>
                <span><strong>Sostanza:</strong> {{ med.substance }}</span>
              </div>
              <div class="med-detail">
                <i class="fas fa-pills"></i>
                <span><strong>Dosaggio:</strong> {{ med.dosage }}</span>
              </div>
              <div class="med-detail usage">
                <i class="fas fa-info-circle"></i>
                <span>{{ med.usage }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      @if (filteredMedications.length === 0) {
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h2>Nessun farmaco trovato</h2>
          <p>Prova a modificare i criteri di ricerca</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { color: var(--primary-color); display: flex; align-items: center; gap: 0.75rem; }
    .page-header p { color: var(--text-muted); margin-top: 0.5rem; }
    
    .search-section { background: white; padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .search-box { position: relative; margin-bottom: 1rem; }
    .search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .search-box input { width: 100%; padding: 0.875rem 1rem 0.875rem 2.75rem; border: 2px solid var(--border-color); border-radius: 8px; font-size: 1rem; }
    .search-box input:focus { outline: none; border-color: var(--primary-color); }
    
    .filters { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .filter-group { display: flex; align-items: center; gap: 0.5rem; }
    .filter-group label { font-weight: 500; color: var(--text-secondary); }
    .filter-group select { padding: 0.5rem 1rem; border: 2px solid var(--border-color); border-radius: 8px; background: white; }
    .results-count { color: var(--text-muted); font-size: 0.9rem; }
    
    .medications-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .medication-card { background: white; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
    .medication-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .medication-card.selected { border-color: var(--primary-color); }
    
    .med-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .med-header h3 { color: var(--text-primary); margin: 0; font-size: 1.1rem; }
    .category-badge { background: #dbeafe; color: #2563eb; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    
    .med-body { display: flex; flex-direction: column; gap: 0.75rem; }
    .med-detail { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.9rem; color: var(--text-secondary); }
    .med-detail i { color: var(--primary-color); margin-top: 0.2rem; width: 16px; }
    .med-detail.usage { flex-direction: column; background: #f7fafc; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem; }
    .med-detail.usage i { margin-bottom: 0.25rem; }
    .med-detail strong { color: var(--text-primary); }
    
    .empty-state { text-align: center; padding: 4rem 2rem; }
    .empty-state i { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1rem; }
    .empty-state h2 { color: var(--text-primary); margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-muted); }
  `]
})
export class MedicationsBrowserComponent {
  medications = COMMON_MEDICATIONS;
  filteredMedications = COMMON_MEDICATIONS;
  searchTerm = '';
  selectedCategory = '';
  selectedMedication: CommonMedication | null = null;

  get categories(): string[] {
    return [...new Set(this.medications.map(m => m.category))].sort();
  }

  filterMedications() {
    const term = this.searchTerm.toLowerCase().trim();
    
    this.filteredMedications = this.medications.filter(med => {
      const matchesSearch = !term || 
        med.name.toLowerCase().includes(term) ||
        med.substance.toLowerCase().includes(term) ||
        med.category.toLowerCase().includes(term) ||
        med.usage.toLowerCase().includes(term);
      
      const matchesCategory = !this.selectedCategory || med.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  selectMedication(med: CommonMedication) {
    this.selectedMedication = this.selectedMedication?.id === med.id ? null : med;
  }
}
