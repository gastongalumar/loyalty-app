import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Html5Qrcode } from 'html5-qrcode';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyCardVisualComponent } from '../../components/loyalty-card/loyalty-card.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { LoyaltyCard } from '../../models/models';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NavbarComponent,
    LoyaltyCardVisualComponent
  ],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnDestroy {
  scannerActive = false;
  manualCode = '';
  note = '';
  loading = false;
  success = false;
  error = '';
  card: LoyaltyCard | null = null;
  private scanner: Html5Qrcode | null = null;

  constructor(
    private loyalty: LoyaltyService,
    private translate: TranslateService
  ) {}

  startScanner(): void {
    if (typeof Html5Qrcode === 'undefined') {
      this.error = this.translate.instant('ERRORS.CAMERA_UNAVAILABLE');
      return;
    }
    this.error = '';
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
      this.error = this.translate.instant('ERRORS.CAMERA_DENIED');
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
    this.loyalty.scanQrAndAddStamp({
      qrCode: this.manualCode.trim(),
      note: this.note || undefined
    }).subscribe({
      next: (card) => {
        this.card = card;
        this.loading = false;
        this.success = true;
        this.manualCode = '';
        this.note = '';
      },
      error: (err) => {
        this.error = err.error?.message || this.translate.instant('ERRORS.INVALID_QR');
        this.loading = false;
      }
    });
  }
}
