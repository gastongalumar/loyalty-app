import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, forkJoin, of } from 'rxjs';
import { NavbarComponent } from '../../components/navbar.component';
import { PlatformService } from '../../services/platform.service';
import { LoyaltyService } from '../../services/loyalty.service';
import { RewardService } from '../../services/reward.service';
import { SlugService } from '../../services/slug.service';
import { Business, Customer, Reward } from '../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  business: Business | null = null;
  customers: Customer[] = [];
  rewards: Reward[] = [];
  availableRewardCount = 0;
  loading = true;
  error = '';
  success = '';
  addingId = 0;
  slug = this.slugService.get() ?? '';

  constructor(
    private platform: PlatformService,
    private loyalty: LoyaltyService,
    private rewardService: RewardService,
    private slugService: SlugService
  ) {}

  ngOnInit(): void {
    forkJoin({
      business: this.platform.getMyBusiness(),
      customers: this.loyalty.getCustomers(undefined, 0, 5).pipe(catchError(() => of(null))),
      rewards: this.rewardService.list('AVAILABLE', undefined, 0, 5).pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ business, customers, rewards }) => {
        this.business = business;
        this.customers = customers?.content ?? [];
        this.rewards = rewards?.content ?? [];
        this.availableRewardCount = rewards?.totalElements ?? 0;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not load dashboard';
        this.loading = false;
      }
    });
  }

  get activeCustomers(): number {
    return this.business?.totalCustomers ?? 0;
  }

  initials(customer: Customer): string {
    const first = customer.firstName?.trim().charAt(0) ?? '';
    const last = customer.lastName?.trim().charAt(0) ?? '';
    return `${first}${last}`.toUpperCase() || '?';
  }

  progress(customer: Customer): number {
    if (!customer.totalStamps) {
      return 0;
    }
    return Math.min((customer.currentStamps / customer.totalStamps) * 100, 100);
  }

  addStamp(customer: Customer): void {
    this.addingId = customer.id;
    this.error = '';
    this.success = '';

    this.loyalty.addStamp({ userId: customer.id }).subscribe({
      next: (card) => {
        customer.currentStamps = card.currentStamps;
        customer.totalStamps = card.totalStamps;
        customer.cardStatus = card.status;
        this.addingId = 0;
        this.success = `${customer.firstName} ${customer.lastName}: ${card.currentStamps}/${card.totalStamps}`;
        setTimeout(() => this.success = '', 2500);
      },
      error: (err) => {
        this.addingId = 0;
        this.error = err.error?.message || 'Could not add stamp';
      }
    });
  }
}
