import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div *ngIf="visible" class="alert" [ngClass]="alertClass" [class.fade-in]="true">
      <span>{{ icon }} {{ message }}</span>
      <button class="alert-close" (click)="dismiss()">✕</button>
    </div>
  `,
  styles: [`
    .alert { justify-content: space-between; }
    .alert-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.8rem;
      opacity: 0.6;
      padding: 2px 6px;
      border-radius: 4px;
      transition: opacity 0.2s;
    }
    .alert-close:hover { opacity: 1; }
  `]
})
export class AlertComponent implements OnChanges {
  @Input() type: 'success' | 'error' | 'info' = 'success';
  @Input() message = '';
  @Input() autoDismiss = true;
  @Input() dismissAfterMs = 3500;
  @Output() dismissed = new EventEmitter<void>();

  visible = false;
  private timer: any;

  get alertClass(): string {
    return `alert-${this.type}`;
  }

  get icon(): string {
    return this.type === 'success' ? '✅' : this.type === 'error' ? '⚠️' : 'ℹ️';
  }

  ngOnChanges() {
    if (this.message) {
      this.visible = true;
      clearTimeout(this.timer);
      if (this.autoDismiss) {
        this.timer = setTimeout(() => this.dismiss(), this.dismissAfterMs);
      }
    } else {
      this.visible = false;
    }
  }

  dismiss() {
    this.visible = false;
    this.dismissed.emit();
  }
}
