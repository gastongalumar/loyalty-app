import { TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { slugGuard } from './slug.guard';
import { SlugService } from '../services/slug.service';
import { ThemeService } from '../services/theme.service';
import { PwaService } from '../services/pwa.service';
import { TenantInfo } from '../models/models';

describe('slugGuard', () => {
  const info: TenantInfo = {
    slug: 'cafe-a',
    name: 'Cafe A',
    status: 'ACTIVE',
    colorPrimary: null,
    colorSecondary: null,
    logoUrl: null
  };

  let slugService: jasmine.SpyObj<SlugService>;
  let theme: jasmine.SpyObj<ThemeService>;
  let pwa: jasmine.SpyObj<PwaService>;

  beforeEach(() => {
    slugService = jasmine.createSpyObj<SlugService>('SlugService', ['isReserved', 'validate', 'clear']);
    theme = jasmine.createSpyObj<ThemeService>('ThemeService', ['apply', 'reset']);
    pwa = jasmine.createSpyObj<PwaService>('PwaService', ['applyTenant']);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: SlugService, useValue: slugService },
        { provide: ThemeService, useValue: theme },
        { provide: PwaService, useValue: pwa }
      ]
    });
  });

  async function run(slug: string) {
    const route = { paramMap: convertToParamMap({ slug }) } as never;
    const result = TestBed.runInInjectionContext(() => slugGuard(route, {} as RouterStateSnapshot));
    return result instanceof Observable ? await firstValueFrom(result) : result;
  }

  it('bloquea slugs reservados', async () => {
    slugService.isReserved.and.returnValue(true);

    const result = await run('platform');

    expect(result instanceof UrlTree).toBeTrue();
    expect(slugService.validate).not.toHaveBeenCalled();
  });

  it('valida el slug y aplica branding + manifest', async () => {
    slugService.isReserved.and.returnValue(false);
    slugService.validate.and.returnValue(of(info));

    const result = await run('cafe-a');

    expect(result).toBeTrue();
    expect(theme.apply).toHaveBeenCalledWith(info);
    expect(pwa.applyTenant).toHaveBeenCalledWith(info);
  });

  it('limpia estado y vuelve a la landing si el tenant no existe', async () => {
    slugService.isReserved.and.returnValue(false);
    slugService.validate.and.returnValue(throwError(() => new Error('404')));

    const result = await run('no-existe');

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/');
    expect(slugService.clear).toHaveBeenCalled();
    expect(theme.reset).toHaveBeenCalled();
    expect(pwa.applyTenant).toHaveBeenCalledWith(null);
  });
});
