import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { slugGuard } from './guards/slug.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'platform/login',
    loadComponent: () => import('./pages/platform-login/platform-login.component').then(m => m.PlatformLoginComponent)
  },
  {
    path: 'platform/businesses',
    canActivate: [authGuard, roleGuard],
    data: { role: 'PLATFORM_ADMIN' },
    loadComponent: () => import('./pages/platform-businesses/platform-businesses.component').then(m => m.PlatformBusinessesComponent)
  },
  {
    path: 'platform/businesses/:id',
    canActivate: [authGuard, roleGuard],
    data: { role: 'PLATFORM_ADMIN' },
    loadComponent: () => import('./pages/platform-business-detail/platform-business-detail.component').then(m => m.PlatformBusinessDetailComponent)
  },
  {
    path: 'platform/settings',
    canActivate: [authGuard, roleGuard],
    data: { role: 'PLATFORM_ADMIN' },
    loadComponent: () => import('./pages/platform-settings/platform-settings.component').then(m => m.PlatformSettingsComponent)
  },
  {
    path: ':slug',
    canActivate: [slugGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'customer',
        canActivate: [authGuard, roleGuard],
        data: { role: 'CUSTOMER' },
        children: [
          {
            path: 'card',
            loadComponent: () => import('./pages/customer-card/customer-card.component').then(m => m.CustomerCardComponent)
          },
          {
            path: 'qr',
            loadComponent: () => import('./pages/qr-display/qr-display.component').then(m => m.QrDisplayComponent)
          },
          { path: '', redirectTo: 'card', pathMatch: 'full' }
        ]
      },
      {
        path: 'business',
        canActivate: [authGuard, roleGuard],
        data: { role: 'BUSINESS_ADMIN' },
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
          },
          {
            path: 'customers',
            loadComponent: () => import('./pages/customer-search/customer-search.component').then(m => m.CustomerSearchComponent)
          },
          {
            path: 'scanner',
            loadComponent: () => import('./pages/qr-scanner/qr-scanner.component').then(m => m.QrScannerComponent)
          },
          {
            path: 'settings',
            loadComponent: () => import('./pages/business-settings/business-settings.component').then(m => m.BusinessSettingsComponent)
          },
          {
            path: 'rewards',
            loadComponent: () => import('./pages/business-rewards/business-rewards.component').then(m => m.BusinessRewardsComponent)
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
