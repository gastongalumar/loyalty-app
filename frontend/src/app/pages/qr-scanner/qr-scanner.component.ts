import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Html5Qrcode } from 'html5-qrcode';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { LoyaltyCard } from '../../models/models';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container" style="padding-top: 24px; padding-bottom: 40px;">
      <div class="page-header">
        <h1 class="page-title">{{ 'BUSINESS.SCANNER_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'BUSINESS.SCANNER_SUBTITLE' | translate }}</p>
      </div>

      <div *ngIf="success" class="alert alert-success">{{ 'BUSINESS.STAMP_ADDED' | translate }}</div>
      <div *ngIf="error" class="alert alert-error">{{ error }}</div>

      <div *ngIf="card" class="card" style="margin-bottom:16px;">
        <strong>{{ card.customerName }}</strong>
        <div style="color: var(--text-secondary);">{{ card.customerEmail }}</div>
        <div class="progress-bar" style="margin: 12px 0;">
          <div class="progress-fill" [style.width.%]="progress"></div>
        </div>
        <div>{{ card.currentStamps }} / {{ card.totalStamps }} · {{ card.status }}</div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div id="qr-reader" style="width:100%;"></div>
        <button *ngIf="!scannerActive" class="btn btn-primary" (click)="startScanner()">
          {{ 'BUSINESS.START_CAMERA' | translate }}
        </button>
      </div>

      <div class="card">
        <label class="form-label">{{ 'BUSINESS.QR_CODE' | translate }}</label>
        <input class="form-control" [(ngModel)]="manualCode" (keydown.enter)="scanManual()" />
        <label class="form-label" style="margin-top:12px;">{{ 'BUSINESS.NOTE' | translate }}</label>
        <input class="form-control" [(ngModel)]="note" />
        <button class="btn btn-primary btn-full" style="margin-top:12px;"
                [disabled]="!manualCode || loading" (click)="scanManual()">
          {{ loading ? ('COMMON.LOADING' | translate) : ('BUSINESS.CONFIRM_SCAN' | translate) }}
        </button>
      </div>
    </div>
  `
})
export class QrScannerComponent implements OnDestroy {
  scannerActive = false;
  manualCode = '';
  note = '';
  loading = false;
  success = false;
  error = '';
  card: LoyaltyCard | null = null;
  private scanner: any = null;

  constructor(private loyalty: LoyaltyService) {}

  get progress(): number {
    if (!this.card || !this.card.totalStamps) {
      return 0;
    }
    return (this.card.currentStamps / this.card.totalStamps) * 100;
  }

  startScanner(): void {
    if (typeof Html5Qrcode === 'undefined') {
      this.error = 'Camera library not available';
      return;
    }
    this.scannerActive = true;
    this.scanner = new Html5Qrcode('qr-reader');
    this.scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decoded: string) => {
        this.stopScanner();
        this.manualCode = decoded;
        this.scanManual();
      },
      () => undefined
    ).catch(() => {
      this.error = 'Camera access denied';
      this.scannerActive = false;
    });
  }

  stopScanner(): void {
    if (this.scanner) {
      this.scanner.stop().catch(() => undefined);
      this.scanner = null;
    }
    this.scannerActive = false;
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  scanManual(): void {
    if (!this.manualCode.trim()) {
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = false;
    // A single call: the scan endpoint validates the QR inside the tenant and adds the stamp.
    this.loyalty.scanQrAndAddStamp({ qrCode: this.manualCode.trim(), note: this.note || undefined }).subscribe({
      next: (card) => {
        this.card = card;
        this.loading = false;
        this.success = true;
        this.manualCode = '';
        this.note = '';
        setTimeout(() => this.success = false, 2500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid QR code';
        this.loading = false;
      }
    });
  }
}
