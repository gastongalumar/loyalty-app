import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/models';

describe('AuthService', () => {
  let service: AuthService;

  const session = (overrides: Partial<AuthResponse>): AuthResponse => ({
    token: 'jwt',
    email: 'user@test.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'CUSTOMER',
    userId: 1,
    tenantId: 10,
    tenantSlug: 'cafe-a',
    ...overrides
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('detecta los tres roles', () => {
    localStorage.setItem('token', 'jwt');
    localStorage.setItem('user', JSON.stringify(session({ role: 'BUSINESS_ADMIN' })));

    expect(service.isBusinessAdmin()).toBeTrue();
    expect(service.isCustomer()).toBeFalse();
    expect(service.isPlatformAdmin()).toBeFalse();
  });

  it('arma la ruta home del business admin con el slug del tenant', () => {
    localStorage.setItem('token', 'jwt');
    localStorage.setItem('user', JSON.stringify(session({ role: 'BUSINESS_ADMIN' })));

    expect(service.homeRoute()).toEqual(['/', 'cafe-a', 'business', 'dashboard']);
  });

  it('arma la ruta home del customer con el slug del tenant', () => {
    localStorage.setItem('token', 'jwt');
    localStorage.setItem('user', JSON.stringify(session({ role: 'CUSTOMER' })));

    expect(service.homeRoute()).toEqual(['/', 'cafe-a', 'customer', 'card']);
  });

  it('el platform admin no depende de slug', () => {
    localStorage.setItem('token', 'jwt');
    localStorage.setItem('user', JSON.stringify(session({
      role: 'PLATFORM_ADMIN', tenantId: null, tenantSlug: null
    })));

    expect(service.isPlatformAdmin()).toBeTrue();
    expect(service.homeRoute()).toEqual(['/platform/businesses']);
  });
});
