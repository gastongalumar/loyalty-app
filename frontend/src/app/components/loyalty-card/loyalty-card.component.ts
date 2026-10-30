import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LoyaltyCard } from '../../models/models';

@Component({
  selector: 'app-loyalty-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './loyalty-card.component.html',
  styleUrls: ['./loyalty-card.component.css']
})
export class LoyaltyCardVisualComponent {
  @Input({ required: true }) card!: LoyaltyCard;

  get stamps(): number[] {
    return Array.from({ length: this.card.totalStamps }, (_, i) => i);
  }

  get progress(): number {
    return this.card.totalStamps
      ? (this.card.currentStamps / this.card.totalStamps) * 100
      : 0;
  }

  get remaining(): number {
    return Math.max(this.card.totalStamps - this.card.currentStamps, 0);
  }

  get statusKey(): string {
    switch (this.card?.status) {
      case 'REWARD_PENDING':
        return 'CUSTOMER.REWARD_READY';
      case 'COMPLETED':
        return 'CUSTOMER.STATUS_COMPLETED';
      default:
        return 'CUSTOMER.STATUS_ACTIVE';
    }
  }
}
