import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LogoComponent } from '../../components/logo.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, LogoComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">

        <!-- 🔥 LOGO PERSONALIZADO -->
        <app-logo
          [showAppName]="true"
          [logoMarginTop]="0"
          [align]="'center'">
        </app-logo>

        <p class="auth-tagline">{{ 'auth.createAccount' | translate }}</p>

        <div class="lang-row">
          <div class="lang-switcher">
            <button class="lang-btn" [class.active]="currentLang === 'en'" (click)="setLang('en')">EN</button>
            <button class="lang-btn" [class.active]="currentLang === 'es'" (click)="setLang('es')">ES</button>
          </div>
        </div>

        <div *ngIf="error" class="alert alert-error">⚠️ {{ error }}</div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ 'auth.firstName' | translate }}</label>
            <input type="text" class="form-control" [(ngModel)]="form.firstName"
                   [placeholder]="'auth.firstName' | translate">
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'auth.lastName' | translate }}</label>
            <input type="text" class="form-control" [(ngModel)]="form.lastName"
                   [placeholder]="'auth.lastName' | translate">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'auth.email' | translate }}</label>
          <input type="email" class="form-control" [(ngModel)]="form.email"
                 [placeholder]="'auth.email' | translate">
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'auth.phone' | translate }}</label>
          <input type="tel" class="form-control" [(ngModel)]="form.phone"
                 [placeholder]="'auth.phone' | translate">
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'auth.password' | translate }}</label>
          <input type="password" class="form-control" [(ngModel)]="form.password"
                 [placeholder]="'auth.password' | translate"
                 (keydown.enter)="onRegister()">
        </div>

        <button class="btn btn-primary btn-full btn-lg" [disabled]="loading" (click)="onRegister()">
          <span *ngIf="!loading">{{ 'auth.signUp' | translate }}</span>
          <span *ngIf="loading">{{ 'auth.registering' | translate }}</span>
        </button>

        <p class="auth-link">
          {{ 'auth.hasAccount' | translate }}
          <a routerLink="/login">{{ 'auth.signIn' | translate }}</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER',
  };
  loading = false;
  error = '';
  currentLang = 'en';

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.currentLang = localStorage.getItem('lang') || 'en';
  }

  setLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  onRegister() {
    this.error = '';
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.password) {
      this.translate.get('common.error').subscribe(msg => this.error = msg);
      return;
    }
    this.loading = true;
    this.authService.register(this.form).subscribe({
      next: () => this.router.navigate(['/customer/card']),
      error: (err) => {
        this.error = err.error?.error || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
