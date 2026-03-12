import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { StampCardComponent } from '../../components/stamp-card.component';
import { LoadingComponent } from '../../components/loading.component';
import { AlertComponent } from '../../components/alert.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { LoyaltyCard } from '../../models/models';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NavbarComponent, StampCardComponent, LoadingComponent, AlertComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container" style="padding-top: 24px; padding-bottom: 32px;">
      <div *ngIf="loading" style="text-align:center; padding: 40px 0;">
        <div class="spinner"></div>
        <p style="color: var(--text-muted);">{{ 'COMMON.LOADING' | translate }}</p>
      </div>

      <div *ngIf="!loading && card" class="fade-in">
        <!-- Loyalty Card Visual -->
        <div class="loyalty-card-visual">
          <div class="loyalty-card-business">{{ card.businessName }}</div>
          <div class="loyalty-card-name">{{ card.customerName }}</div>
          <div class="loyalty-card-reward">🏆 {{ card.rewardDescription }}</div>

          <!-- Stamp Grid -->
          <div class="stamp-grid">
            <div *ngFor="let i of stampArray" class="stamp-cell" [class.filled]="i < card.currentStamps" [class.empty]="i >= card.currentStamps">
              <span *ngIf="i < card.currentStamps">☕</span>
              <span *ngIf="i >= card.currentStamps" style="font-size: 0.9rem;">{{ i + 1 }}</span>
            </div>
          </div>

          <!-- Progress -->
          <div class="progress-bar" style="margin-top: 16px;">
            <div class="progress-fill" [style.width.%]="progressPercent"></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <span style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">
              {{ 'CARD.STAMP_OF' | translate: { current: card.currentStamps, total: card.totalStamps } }}
            </span>
            <span *ngIf="card.status === 'ACTIVE'" style="font-size: 0.8rem; color: var(--accent);">
              {{ 'CARD.STAMPS_AWAY' | translate: { count: card.totalStamps - card.currentStamps } }}
            </span>
            <span *ngIf="card.status === 'REWARD_PENDING'" style="font-size: 0.8rem; color: var(--accent);">
              {{ 'CARD.EARNED_REWARD' | translate }}
            </span>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ card.currentStamps }}/{{ card.totalStamps }}</div>
            <div class="stat-label">{{ 'CARD.STAMPS' | translate }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ card.completedCards }}</div>
            <div class="stat-label">{{ 'CARD.COMPLETED' | translate }}</div>
          </div>
        </div>

        <!-- Reward alert -->
        <div *ngIf="card.status === 'REWARD_PENDING'" class="alert alert-success" style="margin-bottom: 20px;">
          🎉 {{ 'CARD.EARNED_REWARD' | translate }} — {{ card.rewardDescription }}
        </div>

        <!-- QR Button -->
        <a routerLink="/customer/qr" class="btn btn-primary btn-full" style="margin-bottom: 20px;">
          📱 {{ 'CARD.SHOW_QR' | translate }}
        </a>

        <!-- Available Rewards -->
        <div *ngIf="availableRewards.length > 0" class="card" style="margin-bottom: 16px;">
          <h3 style="font-size: 1rem; margin-bottom: 12px;">🏆 {{ 'CARD.REWARDS' | translate }}</h3>
          <div *ngFor="let reward of availableRewards" style="padding: 10px 0; border-bottom: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.9rem;">{{ reward.description }}</span>
              <span class="badge" [class.badge-success]="reward.status === 'AVAILABLE'" [class.badge-secondary]="reward.status === 'REDEEMED'">
                {{ (reward.status === 'AVAILABLE' ? 'CARD.AVAILABLE' : 'CARD.REDEEMED') | translate }}
              </span>
            </div>
          </div>
        </div>

        <!-- Recent Stamps -->
        <div *ngIf="(card.recentStamps?.length ?? 0) > 0" class="card">
          <h3 style="font-size: 1rem; margin-bottom: 12px;">🕐 {{ 'CARD.RECENT_STAMPS' | translate }}</h3>
          <div *ngFor="let stamp of card.recentStamps" style="padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; color: var(--text-secondary);">
            ☕ {{ 'CARD.ADDED_BY' | translate }} <strong>{{ stamp.addedByName }}</strong>
            <span *ngIf="stamp.note"> — {{ stamp.note }}</span>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !card" class="card" style="text-align: center; padding: 40px;">
        <p style="color: var(--text-muted);">{{ 'COMMON.ERROR' | translate }}</p>
      </div>
    </div>
  `
})
export class CustomerCardComponent implements OnInit {
  card: LoyaltyCard | null = null;
  loading = true;
  stampArray: number[] = [];

  get progressPercent() {
    if (!this.card) return 0;
    return (this.card.currentStamps / this.card.totalStamps) * 100;
  }

  get availableRewards() {
    return this.card?.rewards?.filter(r => r.status === 'AVAILABLE') || [];
  }

  constructor(private loyaltyService: LoyaltyService) {}

  ngOnInit() {
    this.loyaltyService.getMyCard().subscribe({
      next: (card) => {
        this.card = card;
        this.stampArray = Array.from({ length: card.totalStamps }, (_, i) => i);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
