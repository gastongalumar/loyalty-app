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
            <input class="form-control" [(ngModel)]="createForm.name" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'COMMON.SLUG' | translate }}</label>
            <input class="form-control" [(ngModel)]="createForm.slug" placeholder="cafe-a" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'BUSINESS.REWARD' | translate }}</label>
          <input class="form-control" [(ngModel)]="createForm.rewardDescription" />
        </div>
        <button class="btn btn-primary" [disabled]="creating" (click)="create()">
          {{ creating ? ('COMMON.LOADING' | translate) : ('COMMON.CREATE' | translate) }}
        </button>
      </div>

      <table class="table">
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
  `,
  styles: [`
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; }
    .table th, .table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eee; }
  `]
})
export class PlatformBusinessesComponent implements OnInit {
  businesses: BusinessSummary[] = [];
  createForm = { name: '', slug: '', rewardDescription: '' };
  creating = false;
  error = '';
  success = '';

  constructor(private platform: PlatformService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.platform.list().subscribe({
      next: (page) => this.businesses = page.content,
      error: (err) => this.error = err.error?.message || 'Could not load businesses'
    });
  }

  create(): void {
    this.creating = true;
    this.error = '';
    this.success = '';
    this.platform.create({
      name: this.createForm.name,
      slug: this.createForm.slug,
      rewardDescription: this.createForm.rewardDescription || undefined,
      stampsRequired: 10
    } as any).subscribe({
      next: (business) => {
        this.creating = false;
        this.success = `${business.name} created`;
        this.createForm = { name: '', slug: '', rewardDescription: '' };
        this.load();
      },
      error: (err) => {
        this.creating = false;
        this.error = err.error?.message || 'Could not create business';
      }
    });
  }

  setStatus(business: BusinessSummary, status: 'ACTIVE' | 'SUSPENDED'): void {
    this.platform.updateStatus(business.id, status).subscribe({
      next: (updated) => business.status = updated.status,
      error: (err) => this.error = err.error?.message || 'Could not update status'
    });
  }
}
