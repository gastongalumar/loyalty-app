import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { PlatformService } from '../../services/platform.service';
import { SlugService } from '../../services/slug.service';
import { Business } from '../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 40px;">
      <div *ngIf="error" class="alert alert-error">{{ error }}</div>

      <ng-container *ngIf="business">
        <div class="page-header">
          <h1 class="page-title">{{ business.name }}</h1>
          <p class="page-subtitle">{{ business.slug }} · {{ business.status }}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ business.totalCustomers }}</div>
            <div class="stat-label">{{ 'BUSINESS.TOTAL_CUSTOMERS' | translate }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ business.stampsRequired }}</div>
            <div class="stat-label">{{ 'BUSINESS.STAMPS_REQUIRED' | translate }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ business.totalAdmins }}</div>
            <div class="stat-label">{{ 'BUSINESS.ADMINS' | translate }}</div>
          </div>
        </div>

        <div class="card">
          <h3>{{ 'BUSINESS.REWARD' | translate }}</h3>
          <p>{{ business.rewardDescription }}</p>
        </div>

        <div style="display:flex; gap:12px; margin-top:16px; flex-wrap:wrap;">
          <a class="btn btn-primary" [routerLink]="['/', slug, 'business', 'scanner']">{{ 'NAV.SCANNER' | translate }}</a>
          <a class="btn btn-secondary" [routerLink]="['/', slug, 'business', 'customers']">{{ 'NAV.CUSTOMERS' | translate }}</a>
          <a class="btn btn-outline" [routerLink]="['/', slug, 'business', 'settings']">{{ 'NAV.SETTINGS' | translate }}</a>
        </div>
      </ng-container>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  business: Business | null = null;
  error = '';
  slug = this.slugService.get() ?? '';

  constructor(private platform: PlatformService, private slugService: SlugService) {}

  ngOnInit(): void {
    this.platform.getMyBusiness().subscribe({
      next: (business) => this.business = business,
      error: (err) => this.error = err.error?.message || 'Could not load business'
    });
  }
}
