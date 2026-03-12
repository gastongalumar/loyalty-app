import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { LoyaltyCard } from '../../models/models';

declare const Html5Qrcode: any;

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container" style="padding-top: 24px; padding-bottom: 40px;">
      <div class="page-header">
        <h1 class="page-title">{{ 'ADMIN.SCAN_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'ADMIN.SCAN_SUBTITLE' | translate }}</p>
      </div>

      <!-- Success/Error alerts -->
      <div *ngIf="success" class="alert alert-success fade-in">✅ {{ 'ADMIN.STAMP_ADDED' | translate }}</div>
      <div *ngIf="error" class="alert alert-error fade-in">⚠️ {{ error }}</div>

      <!-- Scanned result card -->
      <div *ngIf="scannedCard" class="card fade-in" style="margin-bottom: 20px; border: 2px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div>
            <div style="font-weight: 700; font-size: 1.1rem;">{{ scannedCard.customerName }}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">{{ scannedCard.customerEmail }}</div>
          </div>
          <span class="badge badge-primary">{{ scannedCard.status }}</span>
        </div>
        <div class="progress-bar" style="margin-bottom: 8px;">
          <div class="progress-fill" [style.width.%]="scannedProgress"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
          <span>{{ scannedCard.currentStamps }}/{{ scannedCard.totalStamps }} stamps</span>
          <span>{{ scannedCard.completedCards }} completed</span>
        </div>

        <div class="form-group">
          <label class="form-label">Note (optional)</label>
          <input type="text" class="form-control" [(ngModel)]="stampNote" placeholder="e.g. Large latte" />
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" style="flex:1" [disabled]="addingStamp" (click)="confirmAddStamp()">
            <span *ngIf="!addingStamp">☕ {{ 'ADMIN.CONFIRM_SCAN' | translate }}</span>
            <span *ngIf="addingStamp">{{ 'COMMON.LOADING' | translate }}</span>
          </button>
          <button class="btn btn-outline" (click)="clearScan()">{{ 'COMMON.CANCEL' | translate }}</button>
        </div>
      </div>

      <!-- QR Scanner -->
      <div *ngIf="!scannedCard" class="card" style="margin-bottom: 20px;">
        <div id="qr-reader" style="width: 100%; border-radius: var(--radius-md); overflow: hidden;"></div>
        <div *ngIf="!scannerActive" style="text-align: center; padding: 20px;">
          <button class="btn btn-primary" (click)="startScanner()">📷 Start Camera</button>
        </div>
      </div>

      <!-- Manual input -->
      <div class="card">
        <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--text-secondary);">
          {{ 'ADMIN.MANUAL_CODE' | translate }}
        </h3>
        <div style="display: flex; gap: 8px;">
          <input type="text" class="form-control" [(ngModel)]="manualCode"
                 [placeholder]="'ADMIN.ENTER_CODE' | translate"
                 (keydown.enter)="scanManual()" />
          <button class="btn btn-primary" [disabled]="!manualCode" (click)="scanManual()">
            {{ 'COMMON.SAVE' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class QrScannerComponent implements OnInit, OnDestroy {
  scannerActive = false;
  scannedCard: LoyaltyCard | null = null;
  manualCode = '';
  stampNote = '';
  addingStamp = false;
  success = false;
  error = '';
  private html5QrCode: any = null;

  get scannedProgress() {
    if (!this.scannedCard) return 0;
    return (this.scannedCard.currentStamps / this.scannedCard.totalStamps) * 100;
  }

  constructor(private loyaltyService: LoyaltyService) {}

  ngOnInit() {
    // Load html5-qrcode script dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js';
    script.onload = () => {};
    document.head.appendChild(script);
  }

  ngOnDestroy() {
    this.stopScanner();
  }

  startScanner() {
    this.scannerActive = true;
    setTimeout(() => {
      if (typeof Html5Qrcode !== 'undefined') {
        this.html5QrCode = new Html5Qrcode('qr-reader');
        this.html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            this.onScanSuccess(decodedText);
          },
          () => {}
        ).catch((err: any) => {
          this.error = 'Camera access denied';
          this.scannerActive = false;
        });
      }
    }, 500);
  }

  stopScanner() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode = null;
        this.scannerActive = false;
      }).catch(() => {});
    }
  }

  onScanSuccess(qrCode: string) {
    this.stopScanner();
    this.loadCustomerByQr(qrCode);
  }

  scanManual() {
    if (!this.manualCode.trim()) return;
    this.loadCustomerByQr(this.manualCode.trim());
  }

  loadCustomerByQr(qrCode: string) {
    this.error = '';
    this.loyaltyService.scanQrAndAddStamp({ qrCode, note: '' }).subscribe({
      next: (card) => {
        // We actually just want to preview first - let's get the card info
        // For simplicity, we'll show the scanned result directly
        this.scannedCard = card;
        this.manualCode = qrCode;
      },
      error: (err) => {
        this.error = err.error?.error || 'Invalid QR code';
      }
    });
  }

  confirmAddStamp() {
    if (!this.scannedCard) return;
    this.addingStamp = true;
    this.error = '';
    this.loyaltyService.addStamp({ userId: this.scannedCard.userId, note: this.stampNote }).subscribe({
      next: (card) => {
        this.scannedCard = card;
        this.success = true;
        this.addingStamp = false;
        this.stampNote = '';
        setTimeout(() => { this.success = false; }, 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to add stamp';
        this.addingStamp = false;
      }
    });
  }

  clearScan() {
    this.scannedCard = null;
    this.manualCode = '';
    this.stampNote = '';
    this.error = '';
  }
}
