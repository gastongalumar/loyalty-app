import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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

    <div class="page-wrapper">
      <div class="container" style="padding-top: 24px; padding-bottom: 40px;">

        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">{{ 'admin.dashboard' | translate }}</h1>
          <p class="page-subtitle">{{ 'admin.welcomeBack' | translate }}, {{ adminName }}</p>
        </div>

        <!-- Stats grid -->
        <div class="dash-stats">
          <div class="stat-tile">
            <span class="stat-tile-icon">👥</span>
            <div class="stat-tile-value">{{ customers.length }}</div>
            <div class="stat-tile-label">{{ 'admin.totalCustomers' | translate }}</div>
          </div>
          <div class="stat-tile">
            <span class="stat-tile-icon">☕</span>
            <div class="stat-tile-value">{{ totalStamps }}</div>
            <div class="stat-tile-label">{{ 'admin.stampsGiven' | translate }}</div>
          </div>
          <div class="stat-tile">
            <span class="stat-tile-icon">🏆</span>
            <div class="stat-tile-value">{{ totalRewards }}</div>
            <div class="stat-tile-label">{{ 'admin.rewardsEarned' | translate }}</div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="dash-actions">
          <a routerLink="/admin/scanner" class="dash-action dash-action-primary">
            <span class="dash-action-icon">📷</span>
            <span class="dash-action-text">{{ 'admin.scanQr' | translate }}</span>
          </a>
          <a routerLink="/admin/customers" class="dash-action dash-action-secondary">
            <span class="dash-action-icon">🔍</span>
            <span class="dash-action-text">{{ 'admin.searchCustomers' | translate }}</span>
          </a>
          <a routerLink="/admin/fidelity-tiers" class="dash-action dash-action-gold">
            <span class="dash-action-icon">⭐</span>
            <span class="dash-action-text">{{ 'admin.fidelityTiers' | translate }}</span>
          </a>
          <a routerLink="/admin/appearance" class="dash-action dash-action-secondary">
            <span class="dash-action-icon">🎨</span>
            <span class="dash-action-text">{{ 'admin.appearance' | translate }}</span>
          </a>
        </div>

        <!-- Recent customers -->
        <div class="card" style="margin-top: 8px;">
          <div class="dash-list-header">
            <h2 class="section-title" style="margin-bottom:0">
              {{ 'admin.recentCustomers' | translate }}
            </h2>
            <a routerLink="/admin/customers" class="btn btn-outline btn-sm">
              {{ 'common.viewAll' | translate }}
            </a>
          </div>

          <div *ngIf="loading" style="text-align:center; padding:24px;">
            <div class="spinner"></div>
          </div>

          <div *ngIf="!loading">
            <div *ngFor="let c of customers.slice(0, 5); let last = last"
                 class="customer-row" [class.customer-row-last]="last">
              <div class="avatar">{{ c.firstName[0] }}{{ c.lastName[0] }}</div>
              <div class="customer-row-info">
                <div class="customer-row-name">{{ c.firstName }} {{ c.lastName }}</div>
                <div class="customer-row-email">{{ c.email }}</div>
              </div>
              <div class="customer-row-right">
                <div class="customer-row-stamps">
                  {{ c.currentStamps }}/{{ c.totalStamps }} ☕
                </div>
                <span class="badge"
                      [class.badge-success]="c.cardStatus === 'ACTIVE'"
                      [class.badge-warning]="c.cardStatus === 'REWARD_PENDING'">
                  {{ c.cardStatus }}
                </span>
              </div>
            </div>

            <div *ngIf="customers.length === 0" class="empty-state">
              <div class="empty-state-icon">👥</div>
              <div class="empty-state-title">{{ 'admin.noCustomers' | translate }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* Stats */
    .dash-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .stat-tile {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: 16px 12px;
      text-align: center;
      box-shadow: var(--shadow-sm);
    }
    .stat-tile-icon  { font-size: 1.5rem; display: block; margin-bottom: 6px; }
    .stat-tile-value {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 5vw, 2rem);
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
    }
    .stat-tile-label {
      font-size: 0.68rem;
      color: var(--text-muted);
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      line-height: 1.3;
    }

    /* Actions */
    .dash-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }
    .dash-action {
      border-radius: var(--r-lg);
      padding: 18px 12px;
      text-align: center;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      border: 1.5px solid transparent;
    }
    .dash-action:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .dash-action-icon { font-size: 1.8rem; }
    .dash-action-text {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.82rem;
      line-height: 1.2;
    }
    .dash-action-primary  { background: var(--primary); color: white; }
    .dash-action-secondary {
      background: var(--surface);
      border-color: var(--border);
      color: var(--text-primary);
    }
    .dash-action-gold {
      background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light, #ffd369) 100%);
      color: #1a1a0a;
    }

    /* List header */
    .dash-list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    /* Customer rows */
    .customer-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }
    .customer-row-last { border-bottom: none; }
    .customer-row-info { flex: 1; min-width: 0; }
    .customer-row-name {
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .customer-row-email {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .customer-row-right { text-align: right; flex-shrink: 0; }
    .customer-row-stamps {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 4px;
    }

    /* Responsive */
    @media (max-width: 400px) {
      .dash-stats { grid-template-columns: repeat(3, 1fr); gap: 6px; }
      .stat-tile  { padding: 12px 8px; }
      .dash-actions { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  customers: Customer[] = [];
  loading = true;
  adminName = '';

  get totalStamps() {
    return this.customers.reduce((s, c) => s + (c.currentStamps ?? 0), 0);
  }
  get totalRewards() {
    return this.customers.reduce((s, c) => s + (c.completedCards ?? 0), 0);
  }

  constructor(
    private loyaltyService: LoyaltyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.adminName = user?.firstName ?? '';
    this.loyaltyService.getAllCustomers().subscribe({
      next: (data) => { this.customers = data; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }
}
