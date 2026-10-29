import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyService } from '../../services/loyalty.service';

@Component({
  selector: 'app-qr-display',
  standalone: true,
  imports: [CommonModule, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container" style="padding-top: 24px; text-align: center;">
      <div class="page-header">
        <h1 class="page-title">{{ 'CUSTOMER.MY_QR' | translate }}</h1>
      </div>
      <div class="card">
        <p *ngIf="loading">{{ 'COMMON.LOADING' | translate }}</p>
        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <img *ngIf="qr" [src]="qr" alt="QR" style="max-width: 300px; width: 100%;" />
      </div>
    </div>
  `
})
export class QrDisplayComponent implements OnInit {
  qr = '';
  loading = true;
  error = '';

  constructor(private loyalty: LoyaltyService) {}

  ngOnInit(): void {
    this.loyalty.getMyQrCode().subscribe({
      next: (qr) => {
        this.qr = qr;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not load QR';
        this.loading = false;
      }
    });
  }
}
