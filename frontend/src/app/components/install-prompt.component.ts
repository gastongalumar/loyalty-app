import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showPrompt" class="install-prompt">
      <div class="install-content">
        <div class="install-icon">📱</div>
        <div class="install-text">
          <strong>Instalá la app</strong>
          <span>Accedé más rápido desde tu pantalla de inicio</span>
        </div>
        <button class="btn btn-primary btn-sm" (click)="installApp()">Instalar</button>
        <button class="btn-close" (click)="dismiss()">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .install-prompt {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      max-width: 400px;
      margin: 0 auto;
      background: var(--surface);
      border: 2px solid var(--primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      z-index: 1000;
      animation: slideUp 0.3s ease;
    }
    .install-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }
    .install-icon {
      font-size: 2rem;
      background: var(--primary-light);
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .install-text {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .install-text strong {
      font-size: 0.9rem;
      color: var(--text-primary);
    }
    .install-text span {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .btn-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px 8px;
      font-size: 1rem;
    }
    .btn-close:hover {
      color: var(--text-primary);
    }
    @keyframes slideUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  showPrompt = false;
  private deferredPrompt: any;
  private hasBeenDismissed = false;

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
  }

  ngOnDestroy() {
    window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
  }

  private handleBeforeInstallPrompt = (event: any) => {
    event.preventDefault();
    this.deferredPrompt = event;

    // Mostrar el prompt solo si no fue descartado antes
    if (!this.hasBeenDismissed && !this.isAppInstalled()) {
      this.showPrompt = true;
    }
  };

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('App instalada');
      this.showPrompt = false;
    }
    this.deferredPrompt = null;
  }

  dismiss() {
    this.showPrompt = false;
    this.hasBeenDismissed = true;
    // Guardar en localStorage para no mostrar por 7 días
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  }

  private isAppInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
}
