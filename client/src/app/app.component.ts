import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    @if (showNav) {
      <app-sidebar>
        <router-outlet></router-outlet>
      </app-sidebar>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  showNav = false;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.showNav = user !== null;
    });
    this.authService.checkAuth();
  }
}
