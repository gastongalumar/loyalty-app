import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';
import { SlugService } from '../services/slug.service';
import { ThemeService } from '../services/theme.service';

/**
 * Validates the /:slug segment against /api/public/tenants/{slug} before rendering
 * and applies the tenant branding (colors/logo) to the shell.
 */
export const slugGuard: CanActivateFn = (route) => {
  const slugService = inject(SlugService);
  const themeService = inject(ThemeService);
  const router = inject(Router);
  const slug = route.paramMap.get('slug');

  if (!slug || slugService.isReserved(slug)) {
    return router.createUrlTree(['/']);
  }

  return slugService.validate(slug).pipe(
    tap(info => themeService.apply(info)),
    map(() => true),
    catchError(() => {
      slugService.clear();
      themeService.reset();
      return of(router.createUrlTree(['/']));
    })
  );
};
