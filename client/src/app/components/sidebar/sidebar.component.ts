import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav 
        [mode]="isMobile ? 'over' : 'side'" 
        [opened]="!isMobile"
        class="sidenav"
        [fixedInViewport]="isMobile"
        fixedTopGap="0">
        
        <div class="sidenav-header">
          <div class="brand">
            <i class="fas fa-heartbeat"></i>
            <span>Healthdiary</span>
          </div>
        </div>

        <mat-nav-list class="nav-list">
          @for (item of navItems; track item.route) {
            <a mat-list-item 
               [routerLink]="item.route" 
               routerLinkActive="active"
               (click)="isMobile && sidenav.close()">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <button mat-button class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Esci
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        @if (isMobile) {
          <mat-toolbar class="mobile-header">
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
            <span class="brand-title">Healthdiary</span>
          </mat-toolbar>
        }
        <main [class.mobile-main]="isMobile">
          <ng-content></ng-content>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 260px;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      border: none;
    }

    .sidenav-header {
      padding: 1.5rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-size: 1.25rem;
      font-weight: bold;
    }

    .brand i {
      font-size: 1.5rem;
    }

    .nav-list {
      padding-top: 1rem;
    }

    .nav-list a {
      color: rgba(255,255,255,0.85);
      margin: 0.25rem 0.75rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .nav-list a:hover {
      background: rgba(255,255,255,0.15);
      color: white;
    }

    .nav-list a.active {
      background: rgba(255,255,255,0.25);
      color: white;
    }

    .nav-list mat-icon {
      color: rgba(255,255,255,0.85);
    }

    .sidenav-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .logout-btn {
      width: 100%;
      color: rgba(255,255,255,0.85);
      justify-content: flex-start;
      gap: 0.5rem;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.15);
      color: white;
    }

    .content {
      background: #f8fafc;
    }

    .mobile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .brand-title {
      margin-left: 0.5rem;
      font-weight: bold;
    }

    .mobile-main {
      padding: 1rem;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 280px;
      }
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);

  isMobile = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Malattie', icon: 'medical_services', route: '/illnesses' },
    { label: 'Prescrizioni', icon: 'medication', route: '/prescriptions' },
    { label: 'Database Farmaci', icon: 'search', route: '/medications' },
    { label: 'Visite', icon: 'event', route: '/appointments' },
    { label: 'Medici', icon: 'person', route: '/doctors' },
    { label: 'Calendario', icon: 'calendar_month', route: '/calendar' },
    { label: 'Impostazioni', icon: 'settings', route: '/settings' }
  ];

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
