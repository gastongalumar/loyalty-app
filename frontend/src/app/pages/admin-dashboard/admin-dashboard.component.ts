import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { AuthService } from '../../services/auth.service';
import { Customer } from '../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 40px;">
      <div class="page-header">
        <h1 class="page-title">{{ 'ADMIN.DASHBOARD' | translate }}</h1>
        <p class="page-subtitle">Welcome back, {{ adminName }}</p>
      </div>

      <!-- Stats -->
      <div class="dashboard-stats">
        <div class="stat-card-big">
          <div class="stat-icon">👥</div>
          <div>
            <div class="stat-value">{{ customers.length }}</div>
            <div class="stat-label">{{ 'ADMIN.TOTAL_CUSTOMERS' | translate }}</div>
          </div>
        </div>
        <div class="stat-card-big">
          <div class="stat-icon">☕</div>
          <div>
            <div class="stat-value">{{ totalStampsToday }}</div>
            <div class="stat-label">Total Stamps Given</div>
          </div>
        </div>
        <div class="stat-card-big">
          <div class="stat-icon">🏆</div>
          <div>
            <div class="stat-value">{{ totalRewards }}</div>
            <div class="stat-label">Rewards Earned</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <a routerLink="/admin/scanner" class="action-card action-primary">
          <div class="action-icon">📷</div>
          <div class="action-text">{{ 'ADMIN.SCAN_QR' | translate }}</div>
        </a>
        <a routerLink="/admin/customers" class="action-card action-secondary">
          <div class="action-icon">🔍</div>
          <div class="action-text">{{ 'ADMIN.SEARCH_CUSTOMERS' | translate }}</div>
        </a>
      </div>

      <!-- Customer List -->
      <div class="card" style="margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="font-size: 1.1rem;">{{ 'ADMIN.CUSTOMERS_LIST' | translate }}</h2>
          <a routerLink="/admin/customers" class="btn btn-outline btn-sm">View All</a>
        </div>

        <div *ngIf="loading" style="text-align: center; padding: 20px;"><div class="spinner"></div></div>

        <div *ngIf="!loading">
          <div *ngFor="let customer of customers.slice(0, 5)" class="customer-card-item" style="margin-bottom: 10px;">
            <div class="avatar">{{ customer.firstName[0] }}{{ customer.lastName[0] }}</div>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 0.95rem;">{{ customer.firstName }} {{ customer.lastName }}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">{{ customer.email }}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--primary);">
                {{ customer.currentStamps }}/{{ customer.totalStamps }} ☕
              </div>
              <span class="badge" [class.badge-success]="customer.cardStatus === 'ACTIVE'"
                    [class.badge-warning]="customer.cardStatus === 'REWARD_PENDING'">
                {{ customer.cardStatus }}
              </span>
            </div>
          </div>

          <div *ngIf="customers.length === 0" style="text-align: center; padding: 20px; color: var(--text-muted);">
            {{ 'ADMIN.NO_CUSTOMERS' | translate }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card-big {
      background: var(--surface);
      border-radius: var(--radius-lg);
      padding: 20px;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stat-icon { font-size: 2rem; }
    .stat-value { font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--primary); line-height: 1; }
    .stat-label { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }
    .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .action-card {
      border-radius: var(--radius-lg);
      padding: 24px;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .action-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .action-primary { background: var(--primary); color: white; }
    .action-secondary { background: var(--secondary); color: white; }
    .action-icon { font-size: 2rem; }
    .action-text { font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; }
    @media (max-width: 600px) {
      .dashboard-stats { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  customers: Customer[] = [];
  loading = true;
  adminName = '';

  get totalStampsToday() {
    return this.customers.reduce((sum, c) => sum + c.currentStamps, 0);
  }

  get totalRewards() {
    return this.customers.reduce((sum, c) => sum + c.completedCards, 0);
  }

  constructor(private loyaltyService: LoyaltyService, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.adminName = user ? user.firstName : '';

    this.loyaltyService.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
