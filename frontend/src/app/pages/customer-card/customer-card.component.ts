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
      <!-- Alertas -->
      <app-alert *ngIf="successMsg" [message]="successMsg" type="success" (dismissed)="successMsg = ''"></app-alert>
      <app-alert *ngIf="errorMsg" [message]="errorMsg" type="error" (dismissed)="errorMsg = ''"></app-alert>

      <div *ngIf="loading" style="text-align:center; padding: 40px 0;">
        <div class="spinner"></div>
        <p style="color: var(--text-muted);">{{ 'COMMON.LOADING' | translate }}</p>
      </div>

      <div *ngIf="!loading && card" class="fade-in">
        <!-- Loyalty Card Visual -->
        <div class="loyalty-card-visual">
          <div class="loyalty-card-business">{{ card.businessName }}</div>
          <div class="loyalty-card-name">{{ card.customerName }}</div>
          <div class="loyalty-card-reward">🎁 {{ card.rewardDescription }}</div>

          <!-- Stamp Grid -->
          <div class="stamp-grid">
            <div *ngFor="let i of stampArray" class="stamp-cell"
                 [class.filled]="i < card.currentStamps"
                 [class.empty]="i >= card.currentStamps">
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

        <!-- Available Rewards (tarjetas completadas) -->
        <div *ngIf="availableRewards.length > 0" class="card" style="margin-bottom: 16px;">
          <h3 style="font-size: 1rem; margin-bottom: 12px;">🎁 {{ 'CARD.REWARDS' | translate }}</h3>
          <div *ngFor="let reward of availableRewards" style="padding: 10px 0; border-bottom: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.9rem;">{{ reward.description }}</span>
              <div>
                <!-- Estado: Pendiente (solicitud enviada) -->
                <span *ngIf="reward.status === 'REQUESTED'"
                      class="badge badge-warning"
                      style="background: #ff9800; color: white; padding: 4px 8px;">
                  ⏳ Pendiente
                </span>

                <!-- Estado: Aprobado/Canjeado -->
                <span *ngIf="reward.status === 'REDEEMED'"
                      class="badge badge-success"
                      style="background: #4caf50; color: white; padding: 4px 8px;">
                  ✅ Canjeado
                </span>

                <!-- Estado: Disponible (con botón rojo) -->
                <button *ngIf="reward.status === 'AVAILABLE' && !reward.requestedAt"
                        class="btn"
                        style="background: #dc3545; color: white; border: none;"
                        (click)="requestRedemption(reward.id, 'CARD')">
                  🔴 Canjear
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Fidelity Rewards (recompensas por niveles) -->
        <div *ngIf="card.fidelityRewards && card.fidelityRewards.length > 0" class="card" style="margin-bottom: 16px;">
          <h3 style="font-size: 1rem; margin-bottom: 12px;">🏆 Recompensas por fidelidad</h3>
          <div *ngFor="let reward of card.fidelityRewards" style="padding: 10px 0; border-bottom: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.9rem; font-weight: 600;">{{ reward.description }}</span>
                <div style="font-size: 0.75rem; color: var(--text-muted);">
                  Por {{ reward.cardsRequired }} tarjetas completadas
                </div>
              </div>
              <div>
                <!-- Estado: Pendiente (solicitud enviada) -->
                <span *ngIf="reward.status === 'REQUESTED'"
                      class="badge badge-warning"
                      style="background: #ff9800; color: white; padding: 4px 8px;">
                  ⏳ Pendiente
                </span>

                <!-- Estado: Aprobado/Canjeado -->
                <span *ngIf="reward.status === 'REDEEMED'"
                      class="badge badge-success"
                      style="background: #4caf50; color: white; padding: 4px 8px;">
                  ✅ Canjeado
                </span>

                <!-- Estado: Disponible (con botón rojo) -->
                <button *ngIf="reward.status === 'AVAILABLE' && !reward.requestedAt"
                        class="btn"
                        style="background: #dc3545; color: white; border: none;"
                        (click)="requestRedemption(reward.id, 'FIDELITY')">
                  🔴 Canjear
                </button>
              </div>
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
  successMsg = '';
  errorMsg = '';

  get progressPercent() {
    if (!this.card) return 0;
    return (this.card.currentStamps / this.card.totalStamps) * 100;
  }

  get availableRewards() {
    return this.card?.rewards?.filter(r =>
      r.status === 'AVAILABLE' ||
      r.status === 'REQUESTED' ||
      r.status === 'REDEEMED'
    ) || [];
  }
  constructor(private loyaltyService: LoyaltyService) {}

  ngOnInit() {
    this.loadCard();
  }

  loadCard() {
    this.loyaltyService.getMyCard().subscribe({
      next: (card) => {
        this.card = card;
        this.stampArray = Array.from({ length: card.totalStamps }, (_, i) => i);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  requestRedemption(rewardId: number, rewardType: string) {
    this.loyaltyService.requestRedemption({ rewardId, rewardType }).subscribe({
      next: (res) => {
        this.successMsg = 'Solicitud enviada al admin';
        setTimeout(() => this.successMsg = '', 3000);
        this.loadCard();
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Error al solicitar canje';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }
}
