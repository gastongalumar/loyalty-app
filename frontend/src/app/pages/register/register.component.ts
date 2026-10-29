import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { SlugService } from '../../services/slug.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <div class="auth-logo">{{ 'APP.NAME' | translate }}</div>
        <p class="auth-tagline">{{ slug }} · {{ 'AUTH.JOIN_US' | translate }}</p>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.FIRST_NAME' | translate }}</label>
            <input class="form-control" [(ngModel)]="form.firstName" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.LAST_NAME' | translate }}</label>
            <input class="form-control" [(ngModel)]="form.lastName" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'AUTH.EMAIL' | translate }}</label>
          <input type="email" class="form-control" [(ngModel)]="form.email" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'AUTH.PHONE' | translate }}</label>
          <input type="tel" class="form-control" [(ngModel)]="form.phone" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'AUTH.PASSWORD' | translate }}</label>
          <input type="password" class="form-control" [(ngModel)]="form.password" />
        </div>

        <button class="btn btn-primary btn-full btn-lg" [disabled]="loading" (click)="onRegister()">
          {{ loading ? ('COMMON.LOADING' | translate) : ('AUTH.SIGN_UP' | translate) }}
        </button>

        <p class="auth-link">
          {{ 'AUTH.HAS_ACCOUNT' | translate }}
          <a [routerLink]="['/', slug, 'login']">{{ 'AUTH.SIGN_IN' | translate }}</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .auth-link { text-align: center; margin-top: 20px; font-size: 0.9rem; }
  `]
})
export class RegisterComponent {
  form = { firstName: '', lastName: '', email: '', password: '', phone: '' };
  loading = false;
  error = '';
  slug = this.slugService.get() ?? '';

  constructor(
    private authService: AuthService,
    private slugService: SlugService,
    private router: Router
  ) {}

  onRegister(): void {
    this.error = '';
    this.loading = true;
    this.authService.register({
      email: this.form.email.trim(),
      password: this.form.password,
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      phone: this.form.phone || undefined
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(this.authService.homeRoute());
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed';
      }
    });
  }
}
