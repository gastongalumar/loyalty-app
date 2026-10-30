import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { RewardService } from '../../services/reward.service';
import { Reward } from '../../models/models';

interface RewardTab {
  value: string;
  label: string;
}

@Component({
  selector: 'app-business-rewards',
  standalone: true,
  imports: [CommonModule, TranslateModule, NavbarComponent],
  templateUrl: './business-rewards.component.html',
  styleUrls: ['./business-rewards.component.css']
})
export class BusinessRewardsComponent implements OnInit {
  rewards: Reward[] = [];
  status = 'AVAILABLE';
  total = 0;
  loading = false;
  redeeming = 0;
  error = '';
  success = '';

  readonly tabs: RewardTab[] = [
    { value: 'AVAILABLE', label: 'BUSINESS.AVAILABLE' },
    { value: 'REDEEMED', label: 'BUSINESS.REDEEMED' },
    { value: '', label: 'COMMON.ALL' }
  ];

  constructor(private rewardService: RewardService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.load();
  }

  select(value: string): void {
    if (this.status === value) {
      return;
    }
    this.status = value;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.rewardService.list(this.status || undefined).subscribe({
      next: (page) => {
        this.rewards = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not load rewards';
        this.loading = false;
      }
    });
  }

  initials(name?: string): string {
    if (!name) {
      return '?';
    }
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return `${first}${last}`.toUpperCase() || '?';
  }

  redeem(reward: Reward): void {
    this.redeeming = reward.id;
    this.error = '';
    this.success = '';

    this.rewardService.redeem(reward.id).subscribe({
      next: (updated) => {
        this.redeeming = 0;
        this.success = `${updated.customerName}: ${updated.description} → ${this.translate.instant('BUSINESS.REDEEMED')}`;
        this.load();
        setTimeout(() => this.success = '', 3000);
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
