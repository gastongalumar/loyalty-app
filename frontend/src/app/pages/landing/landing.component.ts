import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SlugService } from '../../services/slug.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <div class="auth-logo">{{ 'APP.NAME' | translate }}</div>
        <p class="auth-tagline">{{ 'LANDING.SUBTITLE' | translate }}</p>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>

        <div class="form-group">
          <label class="form-label">{{ 'LANDING.SLUG' | translate }}</label>
          <input class="form-control" [(ngModel)]="slug"
                 [placeholder]="'LANDING.SLUG_PLACEHOLDER' | translate"
                 (keydown.enter)="go()" />
        </div>

        <button class="btn btn-primary btn-full btn-lg" [disabled]="loading || !slug" (click)="go()">
          {{ loading ? ('COMMON.LOADING' | translate) : ('LANDING.GO' | translate) }}
        </button>

        <p class="auth-link">
          <a routerLink="/platform/login">{{ 'AUTH.PLATFORM_LOGIN' | translate }}</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-link { text-align: center; margin-top: 20px; font-size: 0.9rem; }
  `]
})
export class LandingComponent {
  slug = '';
  loading = false;
  error = '';

  constructor(private slugService: SlugService, private router: Router) {}

  go(): void {
    const value = this.slug.trim().toLowerCase();
    if (!value) {
      return;
    }
    if (this.slugService.isReserved(value)) {
      this.error = 'Reserved slug';
      return;
    }

    this.loading = true;
    this.error = '';
    this.slugService.validate(value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/', value, 'login']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Business not found';
      }
    });
  }
}
