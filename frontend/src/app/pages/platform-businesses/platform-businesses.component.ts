import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { PlatformService } from '../../services/platform.service';
import { BusinessSummary } from '../../models/models';

@Component({
  selector: 'app-platform-businesses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 40px;">
      <div class="page-header">
        <h1 class="page-title">{{ 'PLATFORM.BUSINESSES' | translate }}</h1>
      </div>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="success" class="alert alert-success">{{ success }}</div>

      <div class="card" style="margin-bottom:20px;">
        <h3>{{ 'PLATFORM.NEW_BUSINESS' | translate }}</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ 'COMMON.NAME' | translate }}</label>
            <input class="form-control" [(ngModel)]="createForm.name" (ngModelChange)="onNameChange()" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'COMMON.SLUG' | translate }}</label>
            <input class="form-control" [(ngModel)]="createForm.slug" placeholder="cafe-a"
                   (ngModelChange)="onSlugChange($event)" />
            <p style="margin-top:4px; color: var(--color-text-subtle); font-size: var(--text-xs);">
              {{ 'PLATFORM.SLUG_HINT' | translate }}
            </p>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'BUSINESS.REWARD' | translate }}</label>
          <input class="form-control" [(ngModel)]="createForm.rewardDescription" />
        </div>
        <button class="btn btn-primary" [disabled]="!canCreate()" (click)="create()">
          {{ creating ? ('COMMON.LOADING' | translate) : ('COMMON.CREATE' | translate) }}
        </button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>{{ 'COMMON.NAME' | translate }}</th>
            <th>{{ 'COMMON.SLUG' | translate }}</th>
            <th>{{ 'COMMON.STATUS' | translate }}</th>
            <th>{{ 'BUSINESS.TOTAL_CUSTOMERS' | translate }}</th>
            <th>{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let business of businesses">
            <td><a [routerLink]="['/platform/businesses', business.id]">{{ business.name }}</a></td>
            <td>{{ business.slug }}</td>
            <td>{{ business.status }}</td>
            <td>{{ business.totalCustomers }}</td>
            <td>
              <button *ngIf="business.status === 'ACTIVE'" class="btn btn-ghost btn-sm"
                      (click)="setStatus(business, 'SUSPENDED')">{{ 'PLATFORM.SUSPEND' | translate }}</button>
              <button *ngIf="business.status === 'SUSPENDED'" class="btn btn-ghost btn-sm"
                      (click)="setStatus(business, 'ACTIVE')">{{ 'PLATFORM.ACTIVATE' | translate }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class PlatformBusinessesComponent implements OnInit {
  businesses: BusinessSummary[] = [];
  createForm = { name: '', slug: '', rewardDescription: '' };
  creating = false;
  error = '';
  success = '';
  private slugTouched = false;

  constructor(private platform: PlatformService) {}

  ngOnInit(): void {
    this.load();
  }

  onNameChange(): void {
    if (!this.slugTouched) {
      this.createForm.slug = this.slugify(this.createForm.name);
    }
  }

  onSlugChange(value: string): void {
    this.slugTouched = true;
    this.createForm.slug = this.slugify(value);
  }

  canCreate(): boolean {
    const slug = this.createForm.slug;
    return !this.creating
      && this.createForm.name.trim().length >= 2
      && slug.length >= 3
      && slug.length <= 80
      && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
  }

  load(): void {
    this.platform.list().subscribe({
      next: (page) => this.businesses = page.content,
      error: (err) => this.error = err.error?.message || 'Could not load businesses'
    });
  }

  create(): void {
    if (!this.canCreate()) {
      this.error = 'Revisá el nombre y el slug (minúsculas, números y guiones).';
      return;
    }
    this.creating = true;
    this.error = '';
    this.success = '';
    this.platform.create({
      name: this.createForm.name.trim(),
      slug: this.createForm.slug,
      rewardDescription: this.createForm.rewardDescription || undefined,
      stampsRequired: 10
    } as any).subscribe({
      next: (business) => {
        this.creating = false;
        this.success = `${business.name} created`;
        this.createForm = { name: '', slug: '', rewardDescription: '' };
        this.slugTouched = false;
        this.load();
      },
      error: (err) => {
        this.creating = false;
        this.error = this.formatError(err, 'Could not create business');
      }
    });
  }

  setStatus(business: BusinessSummary, status: 'ACTIVE' | 'SUSPENDED'): void {
    this.platform.updateStatus(business.id, status).subscribe({
      next: (updated) => business.status = updated.status,
      error: (err) => this.error = this.formatError(err, 'Could not update status')
    });
  }

  private slugify(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-')
      .slice(0, 80);
  }

  private formatError(err: any, fallback: string): string {
    const fields = err?.error?.fields;
    if (fields && typeof fields === 'object') {
      return Object.entries(fields)
        .map(([field, message]) => `${field}: ${message}`)
        .join(' · ');
    }
    return err?.error?.message || fallback;
  }
}
