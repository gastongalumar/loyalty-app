import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { PlatformService } from '../../services/platform.service';
import { Business } from '../../models/models';

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container" style="padding-top: 24px; padding-bottom: 40px;">
      <div class="page-header">
        <h1 class="page-title">{{ 'BUSINESS.SETTINGS_TITLE' | translate }}</h1>
      </div>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="saved" class="alert alert-success">{{ 'COMMON.SAVED' | translate }}</div>

      <div class="card">
        <div class="form-group">
          <label class="form-label">{{ 'COMMON.NAME' | translate }}</label>
          <input class="form-control" [(ngModel)]="form.name" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'BUSINESS.DESCRIPTION' | translate }}</label>
          <textarea class="form-control" rows="3" [(ngModel)]="form.description"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'BUSINESS.LOGO_URL' | translate }}</label>
          <input class="form-control" [(ngModel)]="form.logoUrl" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'BUSINESS.STAMPS_REQUIRED' | translate }}</label>
          <input type="number" class="form-control" [(ngModel)]="form.stampsRequired" min="1" max="100" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'BUSINESS.REWARD' | translate }}</label>
          <input class="form-control" [(ngModel)]="form.rewardDescription" />
        </div>

        <button class="btn btn-primary btn-full" [disabled]="saving" (click)="save()">
          {{ saving ? ('COMMON.LOADING' | translate) : ('COMMON.SAVE' | translate) }}
        </button>
      </div>
    </div>
  `
})
export class BusinessSettingsComponent implements OnInit {
  form: Partial<Business> = {
    name: '', description: '', logoUrl: '', stampsRequired: 10, rewardDescription: ''
  };
  saving = false;
  saved = false;
  error = '';

  constructor(private platform: PlatformService) {}

  ngOnInit(): void {
    this.platform.getMyBusiness().subscribe({
      next: (business) => this.form = {
        name: business.name,
        description: business.description,
        logoUrl: business.logoUrl,
        stampsRequired: business.stampsRequired,
        rewardDescription: business.rewardDescription
      },
      error: (err) => this.error = err.error?.message || 'Could not load business'
    });
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.saved = false;
    this.platform.updateMyBusiness(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 2500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not save';
        this.saving = false;
      }
    });
  }
}
