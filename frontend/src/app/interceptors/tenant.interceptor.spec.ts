import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { tenantInterceptor } from './tenant.interceptor';
import { SlugService } from '../services/slug.service';

describe('tenantInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let slug: string | null;

  beforeEach(() => {
    slug = 'cafe-a';

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tenantInterceptor])),
        provideHttpClientTesting(),
        { provide: SlugService, useValue: { get: () => slug } }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('agrega X-Tenant-Slug a los endpoints publicos de auth', () => {
    http.post('/api/auth/login', {}).subscribe();

    const request = httpMock.expectOne('/api/auth/login');

    expect(request.request.headers.get('X-Tenant-Slug')).toBe('cafe-a');
    request.flush({});
  });

  it('no agrega el header a requests autenticados', () => {
    http.get('/api/v1/customer/card').subscribe();

    const request = httpMock.expectOne('/api/v1/customer/card');

    expect(request.request.headers.has('X-Tenant-Slug')).toBeFalse();
    request.flush({});
  });

  it('no agrega el header si no hay slug', () => {
    slug = null;

    http.post('/api/auth/register', {}).subscribe();

    const request = httpMock.expectOne('/api/auth/register');

    expect(request.request.headers.has('X-Tenant-Slug')).toBeFalse();
    request.flush({});
  });
});
