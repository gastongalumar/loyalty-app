import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-qr-display',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container" style="padding-top: 32px; text-align: center;">
      <div class="page-header" style="text-align: center;">
        <h1 class="page-title">{{ 'QR.TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'QR.SUBTITLE' | translate }}</p>
      </div>

      <div *ngIf="loading" style="padding: 40px 0;">
        <div class="spinner"></div>
      </div>

      <div *ngIf="!loading && qrImage" class="fade-in" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
        <div class="qr-container">
          <img [src]="qrImage" alt="QR Code" />
        </div>

        <div class="card" style="width: 100%; text-align: center;">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
            {{ 'QR.CODE' | translate }}
          </div>
          <div style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: 3px; color: var(--primary);">
            {{ userQrCode }}
          </div>
        </div>

        <div style="background: var(--surface-2); border-radius: var(--radius-md); padding: 14px 20px; font-size: 0.85rem; color: var(--text-secondary); width: 100%;">
          👋 Hi, <strong>{{ userName }}</strong>! Show this QR code at the counter.
        </div>

        <a routerLink="/customer/card" class="btn btn-outline btn-full">
          ← {{ 'common.back' | translate }}
        </a>
      </div>
    </div>
  `
})
export class QrDisplayComponent implements OnInit {
  qrImage = '';
  loading = true;
  userQrCode = '';
  userName = '';

  constructor(private loyaltyService: LoyaltyService, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.userName = user ? `${user.firstName} ${user.lastName}` : '';

    this.loyaltyService.getMyCard().subscribe({
      next: (card) => {
        this.userQrCode = card.qrCode;
        this.loadQrImage();
      }
    });
  }

  loadQrImage() {
    this.loyaltyService.getMyQrCode().subscribe({
      next: (img) => {
        this.qrImage = img;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
