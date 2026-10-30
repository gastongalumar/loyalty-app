import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, forkJoin, of } from 'rxjs';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { SlugService } from '../../services/slug.service';
import { LoyaltyCard } from '../../models/models';

@Component({
  selector: 'app-qr-display',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NavbarComponent],
  templateUrl: './qr-display.component.html',
  styleUrls: ['./qr-display.component.css']
})
export class QrDisplayComponent implements OnInit {
  card: LoyaltyCard | null = null;
  qr = '';
  loading = true;
  error = '';
  slug = this.slugService.get() ?? '';

  constructor(private loyalty: LoyaltyService, private slugService: SlugService) {}

  get remaining(): number {
    if (!this.card) {
      return 0;
    }
    return Math.max(this.card.totalStamps - this.card.currentStamps, 0);
  }

  ngOnInit(): void {
    forkJoin({
      card: this.loyalty.getMyCard().pipe(catchError(() => of(null))),
      qr: this.loyalty.getMyQrCode().pipe(catchError(() => of('')))
    }).subscribe({
      next: ({ card, qr }) => {
        this.card = card;
        this.qr = qr;
        if (!qr) {
          this.error = 'Could not load QR';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not load QR';
        this.loading = false;
      }
    });
  }
}
