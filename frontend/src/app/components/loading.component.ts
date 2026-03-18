import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="loading-wrapper" [style.padding]="padding">
      <div class="spinner"></div>
      <p *ngIf="message" class="loading-msg">{{ message | translate }}</p>
    </div>
  `,
  styles: [`
    .loading-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .loading-msg {
      margin-top: 12px;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
  `]
})
export class LoadingComponent {
  @Input() message = 'common.loading';
  @Input() padding = '40px 0';
}
