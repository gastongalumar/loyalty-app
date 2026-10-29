import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { RewardService } from '../../services/reward.service';
import { Reward } from '../../models/models';

@Component({
  selector: 'app-business-rewards',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 40px;">
      <div class="page-header">
        <h1 class="page-title">{{ 'BUSINESS.REWARDS_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'BUSINESS.REWARDS_SUBTITLE' | translate }}</p>
      </div>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="success" class="alert alert-success">{{ success }}</div>

      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <select class="form-control" [(ngModel)]="status" (change)="load()" style="max-width:220px;">
          <option value="AVAILABLE">{{ 'BUSINESS.AVAILABLE' | translate }}</option>
          <option value="REDEEMED">{{ 'BUSINESS.REDEEMED' | translate }}</option>
          <option value="">{{ 'COMMON.ALL' | translate }}</option>
        </select>
      </div>

      <div class="card" *ngIf="rewards.length === 0 && !loading">
        {{ 'BUSINESS.NO_REWARDS' | translate }}
      </div>

      <div class="card" *ngFor="let reward of rewards" style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
          <div>
            <strong>{{ reward.customerName }}</strong>
            <div style="color: var(--color-text-muted); font-size: 0.9rem;">{{ reward.description }}</div>
            <div style="color: var(--color-text-subtle); font-size: 0.8rem;">{{ reward.earnedAt | date:'short' }}</div>
          </div>
          <span class="badge badge-primary">{{ reward.status }}</span>
          <button *ngIf="reward.status === 'AVAILABLE'" class="btn btn-primary btn-sm"
                  [disabled]="redeeming === reward.id" (click)="redeem(reward)">
            {{ redeeming === reward.id ? ('COMMON.LOADING' | translate) : ('BUSINESS.REDEEM' | translate) }}
          </button>
          <span *ngIf="reward.status === 'REDEEMED' && reward.redeemedBy" style="font-size:0.85rem;">
            {{ reward.redeemedBy }} · {{ reward.redeemedAt | date:'short' }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class BusinessRewardsComponent implements OnInit {
  rewards: Reward[] = [];
  status = 'AVAILABLE';
  loading = false;
  redeeming = 0;
  error = '';
  success = '';

  constructor(private rewardService: RewardService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.rewardService.list(this.status || undefined).subscribe({
      next: (page) => {
        this.rewards = page.content;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not load rewards';
        this.loading = false;
      }
    });
  }

  redeem(reward: Reward): void {
    this.redeeming = reward.id;
    this.error = '';
    this.success = '';
    this.rewardService.redeem(reward.id).subscribe({
      next: (updated) => {
        this.redeeming = 0;
        this.success = `${updated.customerName}: ${updated.description} -> ${updated.status}`;
        this.load();
      },
      error: (err) => {
        this.redeeming = 0;
        this.error = err.status === 409
          ? this.translate.instant('BUSINESS.ALREADY_REDEEMED')
          : (err.error?.message || 'Could not redeem');
      }
    });
  }
}
