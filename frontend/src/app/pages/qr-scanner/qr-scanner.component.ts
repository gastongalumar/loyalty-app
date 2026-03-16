import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { Html5Qrcode } from 'html5-qrcode';
import { LoyaltyService } from '../../services/loyalty.service';
import { LoyaltyCard } from '../../models/models';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container" style="padding-top: 20px; padding-bottom: 40px;">
      <div class="page-header">
        <h1 class="page-title">{{ 'ADMIN.SCAN_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'ADMIN.SCAN_SUBTITLE' | translate }}</p>
      </div>

      <!-- Alertas -->
      <div *ngIf="success" class="alert alert-success fade-in">✅ {{ success }}</div>
      <div *ngIf="error" class="alert alert-error fade-in">⚠️ {{ error }}</div>

      <!-- ESTADO DE LA CÁMARA -->
      <div *ngIf="cameraStatus" class="alert" [class.alert-info]="!cameraError" [class.alert-error]="cameraError">
        {{ cameraStatus }}
      </div>

      <!-- CONTROLES DEL ESCÁNER -->
      <div class="card" style="margin-bottom: 20px; text-align: center;">
        <div id="qr-reader" style="width: 100%; min-height: 300px; border-radius: var(--radius-md); overflow: hidden;"></div>

        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
          <button *ngIf="!scannerActive" class="btn btn-primary" (click)="startScanner()">
            📷 Iniciar Cámara
          </button>
          <button *ngIf="scannerActive" class="btn btn-danger" (click)="stopScanner()">
            ⏹️ Detener Cámara
          </button>
        </div>

        <p class="hint" style="margin-top: 15px; color: var(--text-muted);">
          También podés <strong>seleccionar un archivo</strong> con un código QR
        </p>
      </div>

      <!-- ENTRADA MANUAL -->
      <div class="card" style="margin-bottom: 20px;">
        <h3 style="font-size: 1rem; margin-bottom: 12px;">🔤 Ingreso manual</h3>
        <div style="display: flex; gap: 10px;">
          <input type="text" class="form-control" [(ngModel)]="manualCode"
                 placeholder="Ingresá el código QR" (keydown.enter)="scanManual()">
          <button class="btn btn-primary" [disabled]="!manualCode" (click)="scanManual()">
            Buscar
          </button>
        </div>
      </div>

      <!-- RESULTADO DEL ESCANEO -->
      <div *ngIf="scannedCard" class="card fade-in" style="border: 2px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div>
            <div style="font-weight: 700; font-size: 1.1rem;">{{ scannedCard.customerName }}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">{{ scannedCard.customerEmail }}</div>
          </div>
          <span class="badge badge-primary">{{ scannedCard.status }}</span>
        </div>

        <div class="progress-bar" style="margin-bottom: 8px;">
          <div class="progress-fill" [style.width.%]="(scannedCard.currentStamps / scannedCard.totalStamps) * 100"></div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span>{{ scannedCard.currentStamps }}/{{ scannedCard.totalStamps }} sellos</span>
          <span>{{ scannedCard.completedCards }} tarjetas completadas</span>
        </div>

        <div class="form-group">
          <label>Nota (opcional)</label>
          <input type="text" class="form-control" [(ngModel)]="stampNote" placeholder="Ej: Café con leche">
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" style="flex:1" [disabled]="addingStamp" (click)="addStamp()">
            {{ addingStamp ? 'Agregando...' : '✅ Agregar sello' }}
          </button>
          <button class="btn btn-outline" (click)="clearScan()">✕ Cancelar</button>
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
  success = '';
  error = '';
  cameraStatus = '';
  cameraError = false;

  private html5QrCode: any = null;

  constructor(private loyaltyService: LoyaltyService) {}

  ngOnInit() {
    console.log('📱 QR Scanner inicializado');
  }

  ngOnDestroy() {
    this.stopScanner();
  }

  async startScanner() {
    this.error = '';
    this.cameraError = false;
    this.cameraStatus = '🔍 Solicitando permiso de cámara...';

    try {
      // Verificar soporte
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a cámara');
      }

      // Verificar permisos (esto dispara el prompt)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Si llegamos acá, hay permiso
      stream.getTracks().forEach(track => track.stop());

      this.cameraStatus = '✅ Permiso concedido, iniciando escáner...';

      // Inicializar escáner
      this.html5QrCode = new Html5Qrcode('qr-reader');
      this.scannerActive = true;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await this.html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText: string) => {
          console.log('✅ QR detectado:', decodedText);
          this.cameraStatus = '✅ QR detectado!';
          this.html5QrCode.pause();
          this.processQrCode(decodedText);
        },
        (errorMessage: string) => {
          // Ignorar errores de escaneo (son normales mientras busca)
          if (!errorMessage.includes('NotFoundException')) {
            console.log('⚠️', errorMessage);
          }
        }
      );

      this.cameraStatus = '✅ Escáner activo. Apuntá a un código QR.';

    } catch (err: any) {
      console.error('❌ Error de cámara:', err);
      this.cameraError = true;
      this.scannerActive = false;

      if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
        this.cameraStatus = '❌ Permiso denegado. Hacé click en el candado 🔒 y permití la cámara.';
      } else if (err.name === 'NotFoundError') {
        this.cameraStatus = '❌ No se encontró ninguna cámara.';
      } else {
        this.cameraStatus = '❌ Error: ' + (err.message || 'desconocido');
      }
    }
  }

  stopScanner() {
    if (this.html5QrCode && this.scannerActive) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode.clear();
        this.html5QrCode = null;
        this.scannerActive = false;
        this.cameraStatus = '⏹️ Escáner detenido';
      }).catch(console.error);
    }
  }

  async processQrCode(qrCode: string) {
    this.error = '';
    try {
      const card = await this.loyaltyService.scanQrAndAddStamp({
        qrCode,
        note: ''
      }).toPromise();

      if (card) {
        this.scannedCard = card;
        this.manualCode = qrCode;
        this.stopScanner();
      } else {
        this.error = 'Error: No se pudo obtener la tarjeta';
      }

    } catch (err: any) {
      this.error = err.error?.error || 'QR inválido';
      // Reanudar escáner
      if (this.html5QrCode) {
        this.html5QrCode.resume();
      }
    }
  }

  scanManual() {
    if (!this.manualCode.trim()) return;
    this.stopScanner();
    this.processQrCode(this.manualCode.trim());
  }

  addStamp() {
    if (!this.scannedCard) return;

    this.addingStamp = true;
    this.error = '';

    this.loyaltyService.addStamp({
      userId: this.scannedCard.userId,
      note: this.stampNote
    }).subscribe({
      next: (card) => {
        this.scannedCard = card;
        this.success = '✅ Sello agregado correctamente';
        this.addingStamp = false;
        this.stampNote = '';
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al agregar sello';
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
