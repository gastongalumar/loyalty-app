import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { LoyaltyCard } from '../../models/models';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container" style="padding-top: 24px; padding-bottom: 40px;">
      <div *ngIf="loading" class="card">{{ 'COMMON.LOADING' | translate }}</div>
      <div *ngIf="error" class="alert alert-error">{{ error }}</div>

      <ng-container *ngIf="card">
        <div class="page-header">
          <h1 class="page-title">{{ 'CUSTOMER.MY_CARD' | translate }}</h1>
          <p class="page-subtitle">{{ card.businessName }} · {{ card.customerName }}</p>
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge badge-primary">{{ card.status }}</span>
            <span>{{ card.currentStamps }} / {{ card.totalStamps }}</span>
          </div>
          <div class="progress-bar" style="margin: 12px 0;">
            <div class="progress-fill" [style.width.%]="progress"></div>
          </div>
          <p>{{ 'CUSTOMER.COMPLETED' | translate }}: {{ card.completedCards }}</p>
          <p style="color: var(--text-secondary);">{{ card.rewardDescription }}</p>
        </div>

        <div class="card" style="margin-top: 16px;">
          <h3>{{ 'CUSTOMER.REWARDS' | translate }}</h3>
          <p *ngIf="card.rewards.length === 0" style="color: var(--text-secondary);">
            {{ 'CUSTOMER.NO_REWARDS' | translate }}
          </p>
          <ul>
            <li *ngFor="let reward of card.rewards">
              {{ reward.description }} — {{ reward.status }}
            </li>
          </ul>
        </div>
      </ng-container>
    </div>
  `
})
export class CustomerCardComponent implements OnInit {
  card: LoyaltyCard | null = null;
  loading = true;
  error = '';

  constructor(private loyalty: LoyaltyService) {}

  get progress(): number {
    if (!this.card || !this.card.totalStamps) {
      return 0;
    }
    return (this.card.currentStamps / this.card.totalStamps) * 100;
  }

  ngOnInit(): void {
    this.loyalty.getMyCard().subscribe({
      next: (card) => {
        this.card = card;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not load card';
        this.loading = false;
      }
    });
  }
}
