import { TranslateService } from '@ngx-translate/core';

const FIELD_KEYS: Record<string, string> = {
  name: 'COMMON.NAME',
  slug: 'COMMON.SLUG',
  rewardDescription: 'BUSINESS.REWARD',
  backgroundUrl: 'BUSINESS.BACKGROUND',
  stampIcon: 'BUSINESS.STAMP_ICON',
  rewardIcon: 'BUSINESS.REWARD_ICON',
  stampsRequired: 'BUSINESS.STAMPS_REQUIRED',
  email: 'AUTH.EMAIL',
  password: 'AUTH.PASSWORD',
  firstName: 'AUTH.FIRST_NAME',
  lastName: 'AUTH.LAST_NAME'
};

interface ApiErrorBody {
  message?: string;
  fields?: Record<string, string>;
}

/**
 * Convierte la respuesta de error del backend en un mensaje legible.
 * Si el backend devuelve errores por campo, muestra la etiqueta traducida.
 */
export function apiErrorMessage(
  err: unknown,
  translate: TranslateService,
  fallback: string
): string {
  const body = (err as { error?: ApiErrorBody })?.error;
  const fields = body?.fields;

  if (fields && typeof fields === 'object') {
    return Object.entries(fields)
      .map(([field, message]) => {
        const key = FIELD_KEYS[field];
        const label = key ? translate.instant(key) : field;
        return `${label}: ${message}`;
      })
      .join(' · ');
  }

  return body?.message || fallback;
}
