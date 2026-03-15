import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-container"
         [style.alignItems]="alignItems"
         [style.flexDirection]="direction">

      <img *ngIf="themeService.getTheme().logoUrl"
           [src]="getImageUrl(themeService.getTheme().logoUrl)"
           [style.width.px]="effectiveLogoSize"
           [style.height.px]="effectiveLogoSize"
           [style.objectFit]="'contain'"
           [style.marginBottom.px]="showAppName && direction === 'column' ? 4 : 0"
           [style.marginRight.px]="showAppName && direction === 'row' ? 6 : 0"
           [style.cursor]="'pointer'"
           (click)="navigateToHome()"
           [alt]="appName"
           class="logo-image">

      <div *ngIf="showAppName"
           class="app-name"
           [style.fontSize.px]="effectiveNameSize"
           [style.fontFamily]="'var(--font-display)'"
           [style.fontWeight]="'800'"
           [style.color]="textColor"
           [style.letterSpacing]="'-0.5px'"
           [style.marginTop.px]="direction === 'column' ? logoMarginTop : 0"
           [style.cursor]="'pointer'"
           (click)="navigateToHome()">
        {{ effectiveAppName }}
      </div>
    </div>
  `,
  styles: [`
    .logo-container {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    .logo-image {
      transition: opacity 0.2s ease;
    }
    .logo-image:hover {
      opacity: 0.85;
    }
    .app-name {
      line-height: 1.2;
      transition: opacity 0.2s ease;
    }
    .app-name:hover {
      opacity: 0.8;
    }
  `]
})
export class LogoComponent implements OnInit {
  @Input() showAppName = true;
  @Input() appName = '';
  @Input() logoSize = 0;
  @Input() nameSize = 0;
  @Input() logoMarginTop = 0;
  @Input() align: 'left' | 'center' | 'right' = 'center';
  @Input() direction: 'row' | 'column' = 'column';
  @Input() textColor = 'var(--primary)';

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {}

  get effectiveAppName(): string {
    return this.appName || this.themeService.getTheme().appName || 'LoyaltyCard';
  }

  get effectiveLogoSize(): number {
    return this.logoSize || this.themeService.getTheme().logoSize || 32;
  }

  get effectiveNameSize(): number {
    return this.nameSize || this.themeService.getTheme().nameSize || 18;
  }

  get alignItems(): string {
    switch (this.align) {
      case 'left': return 'flex-start';
      case 'right': return 'flex-end';
      default: return 'center';
    }
  }

  // NUEVO: Método para obtener la URL correcta de la imagen
  getImageUrl(path: string): string {
    return this.themeService.getImageUrl(path);
  }

  navigateToHome() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'CUSTOMER') {
          this.router.navigate(['/customer/card']);
        } else if (user.role === 'BUSINESS_OWNER') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
      } catch {
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
