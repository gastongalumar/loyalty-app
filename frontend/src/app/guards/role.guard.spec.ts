import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getRole', 'isLoggedIn', 'homeRoute']);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth }
      ]
    });
  });

  function run(role: string | string[]) {
    const route = { data: { role } } as never;
    return TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));
  }

  it('permite el rol exacto', () => {
    auth.getRole.and.returnValue('CUSTOMER');

    expect(run('CUSTOMER')).toBeTrue();
  });

  it('permite un rol incluido en la lista', () => {
    auth.getRole.and.returnValue('BUSINESS_ADMIN');

    expect(run(['PLATFORM_ADMIN', 'BUSINESS_ADMIN'])).toBeTrue();
  });

  it('redirige al home del rol cuando el rol no coincide', () => {
    auth.getRole.and.returnValue('CUSTOMER');
    auth.isLoggedIn.and.returnValue(true);
    auth.homeRoute.and.returnValue(['/', 'cafe-a', 'customer', 'card']);

    const result = run('PLATFORM_ADMIN');

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/cafe-a/customer/card');
  });

  it('redirige a la landing si no hay sesion', () => {
    auth.getRole.and.returnValue(null);
    auth.isLoggedIn.and.returnValue(false);

    const result = run('CUSTOMER');

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/');
  });
});
