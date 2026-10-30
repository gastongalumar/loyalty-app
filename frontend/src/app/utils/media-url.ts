import { environment } from '../../environments/environment';

/**
 * Resuelve URLs de medios guardadas por el backend.
 * En desarrollo el frontend corre en otro puerto, así que una ruta relativa
 * `/api/files/...` necesita el origen del API. En producción nginx ya la sirve.
 */
export function mediaUrl(url?: string | null): string {
  if (!url) {
    return '';
  }
  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }
  if (url.startsWith('/api/')) {
    return `${environment.apiUrl.replace(/\/api\/?$/, '')}${url}`;
  }
  return url;
}
