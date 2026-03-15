import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthService, UserProfile } from '../../services/health.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings">
      <header class="settings-header">
        <h1><i class="fas fa-cog"></i> Impostazioni</h1>
        <p class="subtitle">Gestisci il tuo profilo e i tuoi dati</p>
      </header>

      <div class="settings-grid">
        <section class="card">
          <h2><i class="fas fa-user"></i> Profilo Personale</h2>
          <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
            <div class="form-row">
              <div class="form-group">
                <label for="birthDate">Data di nascita</label>
                <input type="date" id="birthDate" [(ngModel)]="profile.birthDate" name="birthDate">
              </div>
              <div class="form-group">
                <label for="bloodType">Gruppo sanguigno</label>
                <select id="bloodType" [(ngModel)]="profile.bloodType" name="bloodType">
                  <option value="">Seleziona...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="0+">0+</option>
                  <option value="0-">0-</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="height">Altezza (cm)</label>
                <input type="number" id="height" [(ngModel)]="profile.height" name="height" min="50" max="250">
              </div>
              <div class="form-group">
                <label for="weight">Peso (kg)</label>
                <input type="number" id="weight" [(ngModel)]="profile.weight" name="weight" min="20" max="300">
              </div>
            </div>

            <div class="form-group">
              <label for="allergies">Allergie</label>
              <textarea id="allergies" [(ngModel)]="profile.allergies" name="allergies" rows="2" placeholder="Elenca le tue allergie..."></textarea>
            </div>

            <div class="form-group">
              <label for="chronicConditions">Condizioni croniche</label>
              <textarea id="chronicConditions" [(ngModel)]="profile.chronicConditions" name="chronicConditions" rows="2" placeholder="Elenca condizioni croniche..."></textarea>
            </div>

            <h3><i class="fas fa-phone-alt"></i> Contatto emergenza</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="emergencyContactName">Nome</label>
                <input type="text" id="emergencyContactName" [(ngModel)]="profile.emergencyContactName" name="emergencyContactName" placeholder="Nome del contatto">
              </div>
              <div class="form-group">
                <label for="emergencyContactRelationship">Relazione</label>
                <input type="text" id="emergencyContactRelationship" [(ngModel)]="profile.emergencyContactRelationship" name="emergencyContactRelationship" placeholder="Es. Coniuge, Fratello">
              </div>
            </div>

            <div class="form-group">
              <label for="emergencyContactPhone">Telefono</label>
              <input type="tel" id="emergencyContactPhone" [(ngModel)]="profile.emergencyContactPhone" name="emergencyContactPhone" placeholder="Numero di telefono">
            </div>

            <div class="form-group">
              <label for="notes">Note</label>
              <textarea id="notes" [(ngModel)]="profile.notes" name="notes" rows="3" placeholder="Altre informazioni utili..."></textarea>
            </div>

            <button type="submit" class="btn-primary" [disabled]="saving">
              <i class="fas" [class.fa-save]="!saving" [class.fa-spinner]="saving" [class.fa-spin]="saving"></i>
              {{ saving ? 'Salvataggio...' : 'Salva Profilo' }}
            </button>
            @if (saveSuccess) {
              <span class="success-message"><i class="fas fa-check-circle"></i> Profilo salvato!</span>
            }
          </form>
        </section>

        <section class="card">
          <h2><i class="fas fa-database"></i> Gestione Dati</h2>
          
          <div class="data-section">
            <h3><i class="fas fa-download"></i> Esporta dati</h3>
            <p>Scarica tutti i tuoi dati in formato JSON. Puoi usare questo file per backup o per importare i dati su un altro dispositivo.</p>
            <button (click)="exportData()" class="btn-secondary" [disabled]="exporting">
              <i class="fas" [class.fa-download]="!exporting" [class.fa-spinner]="exporting" [class.fa-spin]="exporting"></i>
              {{ exporting ? 'Esportazione...' : 'Esporta JSON' }}
            </button>
          </div>

          <div class="data-section">
            <h3><i class="fas fa-upload"></i> Importa dati</h3>
            <p>Importa i dati da un file JSON precedentemente esportato. I dati esistenti non verranno sovrascritti.</p>
            <input type="file" (change)="onFileSelected($event)" accept=".json" #fileInput>
            @if (importFile) {
              <div class="file-preview">
                <i class="fas fa-file-code"></i> {{ importFile.name }}
              </div>
              <button (click)="importData()" class="btn-secondary" [disabled]="importing">
                <i class="fas" [class.fa-upload]="!importing" [class.fa-spinner]="importing" [class.fa-spin]="importing"></i>
                {{ importing ? 'Importazione...' : 'Importa' }}
              </button>
            }
            @if (importResult) {
              <div class="import-result">
                <i class="fas fa-check-circle"></i> Importati: 
                {{ importResult.illnesses }} malattie, 
                {{ importResult.prescriptions }} prescrizioni, 
                {{ importResult.appointments }} appuntamenti,
                {{ importResult.doctors }} medici
              </div>
            }
          </div>
        </section>

        <section class="card">
          <h2><i class="fas fa-file-pdf"></i> Report PDF</h2>
          <p>Genera un report PDF completo con tutti i tuoi dati sanitari. Puoi stamparlo o salvarlo.</p>
          <button (click)="generateReport()" class="btn-primary" [disabled]="generating">
            <i class="fas" [class.fa-file-pdf]="!generating" [class.fa-spinner]="generating" [class.fa-spin]="generating"></i>
            {{ generating ? 'Generazione...' : 'Genera Report' }}
          </button>
        </section>

        <section class="card">
          <h2><i class="fas fa-info-circle"></i> Informazioni</h2>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">Utente:</span>
              <span class="info-value">{{ userName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Versione:</span>
              <span class="info-value">1.2.0</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .settings { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .settings-header { text-align: center; margin-bottom: 2rem; }
    .settings-header h1 { color: var(--primary-color); display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
    .subtitle { color: var(--text-muted); margin-top: 0.5rem; }
    .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
    .card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .card h2 { font-size: 1.1rem; color: var(--text-primary); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
    .card h2 i { color: var(--primary-color); }
    .card h3 { font-size: 1rem; color: var(--text-secondary); margin: 1.5rem 0 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; transition: border-color 0.2s, box-shadow 0.2s; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(102,126,234,0.15); }
    .btn-primary, .btn-secondary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; font-size: 0.95rem; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-primary:hover:not(:disabled) { background: #5a67d8; }
    .btn-secondary { background: #edf2f7; color: var(--text-secondary); }
    .btn-secondary:hover:not(:disabled) { background: #e2e8f0; }
    .btn-primary:disabled, .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
    .success-message { color: #059669; margin-left: 1rem; font-weight: 500; }
    .data-section { padding: 1rem 0; border-bottom: 1px solid #e2e8f0; }
    .data-section:last-child { border-bottom: none; }
    .data-section p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; }
    input[type="file"] { margin: 0.5rem 0; }
    .file-preview { background: #f7fafc; padding: 0.75rem; border-radius: 8px; margin: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); }
    .import-result { background: #d1fae5; color: #059669; padding: 0.75rem; border-radius: 8px; margin-top: 1rem; font-weight: 500; }
    .info-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .info-item { display: flex; justify-content: space-between; }
    .info-label { color: var(--text-muted); }
    .info-value { color: var(--text-primary); font-weight: 500; }
    @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class SettingsComponent implements OnInit {
  private healthService = inject(HealthService);
  private authService = inject(AuthService);

  profile: UserProfile = {
    id: '',
    user_id: '',
    birthDate: null,
    bloodType: null,
    height: null,
    weight: null,
    allergies: null,
    chronicConditions: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    emergencyContactRelationship: null,
    notes: null
  };

  userName = '';
  saving = false;
  saveSuccess = false;
  exporting = false;
  importing = false;
  generating = false;
  importFile: File | null = null;
  importResult: any = null;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.displayName || user.username;
      }
    });
    this.loadProfile();
  }

  loadProfile() {
    this.healthService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: () => {
        this.profile = {
          id: '',
          user_id: '',
          birthDate: null,
          bloodType: null,
          height: null,
          weight: null,
          allergies: null,
          chronicConditions: null,
          emergencyContactName: null,
          emergencyContactPhone: null,
          emergencyContactRelationship: null,
          notes: null
        };
      }
    });
  }

  saveProfile() {
    this.saving = true;
    this.saveSuccess = false;
    this.healthService.updateProfile(this.profile).subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  exportData() {
    this.exporting = true;
    this.healthService.exportData().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthdiary-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => {
        this.exporting = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.importFile = input.files[0];
      this.importResult = null;
    }
  }

  importData() {
    if (!this.importFile) return;
    this.importing = true;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        this.healthService.importData(data).subscribe({
          next: (result) => {
            this.importing = false;
            this.importResult = result.imported;
            this.importFile = null;
          },
          error: () => {
            this.importing = false;
          }
        });
      } catch {
        this.importing = false;
      }
    };
    reader.readAsText(this.importFile);
  }

  generateReport() {
    this.generating = true;
    this.healthService.getReport().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = `healthdiary-report-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.generating = false;
      },
      error: () => {
        this.generating = false;
      }
    });
  }
}
