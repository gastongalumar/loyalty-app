import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoyaltyCard } from '../models/models';

@Component({
  selector: 'app-stamp-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loyalty-card-visual">
      <!-- Decorative circles via CSS ::before ::after -->
      <div class="lc-business">{{ card.businessName }}</div>
      <div class="lc-name">{{ card.customerName }}</div>
      <div class="lc-reward">🏆 {{ card.rewardDescription }}</div>

      <div class="stamp-grid">
        <div
          *ngFor="let i of stampArray"
          class="stamp-cell"
          [class.filled]="i < card.currentStamps"
          [class.empty]="i >= card.currentStamps"
        >
          <span *ngIf="i < card.currentStamps">☕</span>
          <span *ngIf="i >= card.currentStamps" class="stamp-num">{{ i + 1 }}</span>
        </div>
      </div>

      <div class="progress-bar" style="margin-top:16px;">
        <div class="progress-fill" [style.width.%]="progressPercent"></div>
      </div>

      <div class="lc-footer">
        <span>{{ card.currentStamps }}/{{ card.totalStamps }} stamps</span>
        <span *ngIf="card.status === 'ACTIVE'" class="lc-hint">
          {{ card.totalStamps - card.currentStamps }} more to go
        </span>
        <span *ngIf="card.status === 'REWARD_PENDING'" class="lc-hint reward-ready">
          🎉 Reward ready!
        </span>
      </div>
    </div>
  `,
  styles: [`
    .lc-business {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.55);
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 4px;
    }
    .lc-name {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 700;
      color: white;
      margin-bottom: 14px;
    }
    .lc-reward {
      background: rgba(255,209,102,0.14);
      border: 1px solid rgba(255,209,102,0.28);
      border-radius: var(--radius-md);
      padding: 8px 12px;
      font-size: 0.82rem;
      color: var(--accent);
      margin-bottom: 18px;
      position: relative;
      z-index: 1;
    }
    .lc-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 0.78rem;
      color: rgba(255,255,255,0.55);
    }
    .lc-hint { color: rgba(255,255,255,0.55); }
    .reward-ready { color: var(--accent) !important; }
    .stamp-num { font-size: 0.82rem; color: #aaa; }
  `]
})
export class StampCardComponent {
  @Input({ required: true }) card!: LoyaltyCard;

  get stampArray(): number[] {
    return Array.from({ length: this.card.totalStamps }, (_, i) => i);
  }

  get progressPercent(): number {
    return (this.card.currentStamps / this.card.totalStamps) * 100;
  }
}
