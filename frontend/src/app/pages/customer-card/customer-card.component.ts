import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppDatePipe } from '../../pipes/app-date.pipe';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyCardVisualComponent } from '../../components/loyalty-card/loyalty-card.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { SlugService } from '../../services/slug.service';
import { LoyaltyCard, Reward } from '../../models/models';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    AppDatePipe,
    NavbarComponent,
    LoyaltyCardVisualComponent
  ],
  templateUrl: './customer-card.component.html',
  styleUrls: ['./customer-card.component.css']
})
export class CustomerCardComponent implements OnInit {
  card: LoyaltyCard | null = null;
  loading = true;
  error = '';
  slug = '';

  constructor(
    private loyalty: LoyaltyService,
    private slugService: SlugService,
    private translate: TranslateService
  ) {}

  get availableRewards(): Reward[] {
    return this.card?.rewards.filter((reward) => reward.status === 'AVAILABLE') ?? [];
  }

  ngOnInit(): void {
    this.slug = this.slugService.get() ?? '';
    this.loyalty.getMyCard().subscribe({
      next: (card) => {
        this.card = card;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || this.translate.instant('ERRORS.LOAD_CARD');
        this.loading = false;
      }
    });
  }
}
