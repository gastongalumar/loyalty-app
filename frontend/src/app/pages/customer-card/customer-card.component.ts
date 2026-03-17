// frontend/src/app/pages/customer-card/customer-card.component.ts

import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from '../../services/loyalty.service';
import { AuthService } from '../../services/auth.service';
import { FidelityReward, LoyaltyCard } from '../../models/models';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-card.component.html',
  styleUrls: ['./customer-card.component.scss']
})
export class CustomerCardComponent implements OnInit, OnDestroy {

  card: LoyaltyCard | null = null;
  loading = true;
  errorMsg = '';
  successMsg = '';
  showQrModal = false;
  qrImageUrl = '';
  redemptionLoading = false;
  activeTab: 'stamps' | 'rewards' | 'fidelity' = 'stamps';

  private destroy$ = new Subject<void>();

  constructor(
    private loyaltyService: LoyaltyService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ✅ BUG FIX #5 (frontend): Subscribe to reactive card$ stream.
    // Any update pushed by refreshCard() automatically triggers re-render.
    this.loyaltyService.card$
      .pipe(takeUntil(this.destroy$))
      .subscribe(card => {
        this.card = card;
        this.loading = false;
        this.cdr.markForCheck(); // required for OnPush
      });

    this.loyaltyService.getMyCard().subscribe({
      error: () => {
        this.errorMsg = 'Could not load your card. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Stamp progress ──────────────────────────────────────────────────────────

  get stampArray(): number[] {
    if (!this.card) return [];
    return Array.from({ length: this.card.totalStamps }, (_, i) => i);
  }

  /**
   * ✅ BUG FIX: Progress bar percentage — safe division, clamped 0-100.
   * Previously was calculated with raw division that could produce NaN
   * when totalStamps was 0 or card was null.
   */
  get stampProgressPercent(): number {
    if (!this.card || !this.card.totalStamps) return 0;
    return Math.min(100, Math.round((this.card.currentStamps / this.card.totalStamps) * 100));
  }

  /**
   * ✅ Bonus progress bar percentage — uses pre-computed field from backend.
   * Falls back to local computation if backend field is absent (defensive).
   */
  get bonusProgressPercent(): number {
    if (!this.card) return 0;
    if (this.card.bonusProgressPercent != null) return this.card.bonusProgressPercent;
    // Fallback: compute locally
    if (!this.card.nextBonusCardsRequired || this.card.nextBonusCardsRequired === 0) return 0;
    return Math.min(100, Math.round(
      (this.card.completedCards / this.card.nextBonusCardsRequired) * 100
    ));
  }

  get stampsRemaining(): number {
    if (!this.card) return 0;
    return Math.max(0, this.card.totalStamps - this.card.currentStamps);
  }

  get cardsToNextBonus(): number {
    if (!this.card || !this.card.nextBonusCardsRequired) return 0;
    return Math.max(0, this.card.nextBonusCardsRequired - this.card.completedCards);
  }

  // ── Rewards ─────────────────────────────────────────────────────────────────

  get availableRewards() {
    return this.card?.rewards?.filter(r => r.status === 'AVAILABLE') ?? [];
  }

  get pendingRewards() {
    return this.card?.rewards?.filter(r => r.status === 'REQUESTED') ?? [];
  }

  get redeemedRewards() {
    return this.card?.rewards?.filter(r => r.status === 'REDEEMED') ?? [];
  }

  get availableFidelityRewards(): FidelityReward[] {
    return this.card?.fidelityRewards?.filter(r => r.status === 'AVAILABLE') ?? [];
  }

  get pendingFidelityRewards(): FidelityReward[] {
    return this.card?.fidelityRewards?.filter(r => r.status === 'REQUESTED') ?? [];
  }

  get fidelityRewardsBadgeCount(): number {
    return this.availableFidelityRewards.length;
  }

  get totalRewardsBadgeCount(): number {
    return this.availableRewards.length + this.availableFidelityRewards.length;
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  openQr(): void {
    this.showQrModal = true;
    if (!this.qrImageUrl) {
      this.loyaltyService.getMyQrCode().subscribe({
        next: img => {
          this.qrImageUrl = img;
          this.cdr.markForCheck();
        }
      });
    }
  }

  closeQr(): void {
    this.showQrModal = false;
  }

  requestRedemption(rewardId: number, rewardType: 'CARD' | 'FIDELITY'): void {
    if (this.redemptionLoading) return;
    this.redemptionLoading = true;
    this.loyaltyService.requestRedemption({ rewardId, rewardType }).subscribe({
      next: () => {
        this.successMsg = '🎉 Redemption requested! The shop will confirm shortly.';
        this.redemptionLoading = false;
        this.cdr.markForCheck();
        setTimeout(() => { this.successMsg = ''; this.cdr.markForCheck(); }, 4000);
      },
      error: () => {
        this.errorMsg = 'Could not request redemption. Please try again.';
        this.redemptionLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  setTab(tab: 'stamps' | 'rewards' | 'fidelity'): void {
    this.activeTab = tab;
  }

  rewardStatusLabel(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'Redeem';
      case 'REQUESTED': return 'Pending';
      case 'REDEEMED':  return 'Used';
      default:          return status;
    }
  }
}
