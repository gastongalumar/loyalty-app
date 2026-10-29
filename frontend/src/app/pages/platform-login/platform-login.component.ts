import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { SlugService } from '../../services/slug.service';

@Component({
  selector: 'app-platform-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <div class="auth-logo">{{ 'APP.NAME' | translate }}</div>
        <p class="auth-tagline">{{ 'PLATFORM.LOGIN_TITLE' | translate }}</p>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>

        <div class="form-group">
          <label class="form-label">{{ 'AUTH.EMAIL' | translate }}</label>
          <input type="email" class="form-control" [(ngModel)]="email" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'AUTH.PASSWORD' | translate }}</label>
          <input type="password" class="form-control" [(ngModel)]="password" (keydown.enter)="login()" />
        </div>

        <button class="btn btn-primary btn-full btn-lg" [disabled]="loading" (click)="login()">
          {{ loading ? ('COMMON.LOADING' | translate) : ('AUTH.SIGN_IN' | translate) }}
        </button>
      </div>
    </div>
  `
})
export class PlatformLoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private slugService: SlugService,
    private router: Router
  ) {
    // A platform login must never carry a tenant slug from a previous session.
    this.slugService.clear();
  }

  login(): void {
    this.error = '';
    this.loading = true;
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.role === 'PLATFORM_ADMIN') {
          this.router.navigate(['/platform/businesses']);
        } else {
          this.error = 'Not a platform administrator';
          this.auth.logout();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }
}
