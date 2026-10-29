import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = route.data['role'] as Role | Role[] | undefined;

  if (!required) {
    return true;
  }

  const role = auth.getRole();
  const allowed = Array.isArray(required) ? required.includes(role as Role) : role === required;

  if (allowed) {
    return true;
  }

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/']);
  }

  return router.createUrlTree(auth.homeRoute());
};
