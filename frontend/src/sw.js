/* Loyalty Card — service worker multi-tenant.
 *
 * Un solo SW (scope "/") con caches particionadas por slug:
 *   - assets de la app  -> loyalty-shell-v1 (compartido, no contiene datos de tenant)
 *   - navegacion /:slug -> loyalty-tenant-<slug>-v1
 *
 * Nunca se responde una request de un tenant con una entrada de otro: el cache
 * se elige a partir del prefijo de la URL y no hay fallback cruzado.
 * Las rutas /api, /actuator y /platform no se cachean.
 */

const VERSION = 'v2';
const SHELL_CACHE = `loyalty-shell-${VERSION}`;
const TENANT_CACHE_PREFIX = 'loyalty-tenant-';
const SHELL_ASSETS = [
  '/index.html',
  '/assets/icons/icon.svg',
  '/assets/icons/icon-maskable.svg'
];
const RESERVED = ['platform', 'api', 'assets', 'login', 'register', 'admin', 'customer'];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = new RegExp(`^${TENANT_CACHE_PREFIX}[a-z0-9-]+-${VERSION}$`);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && !keep.test(key))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (data.type === 'CLEAR_TENANT' && data.slug) {
    const prefix = `${TENANT_CACHE_PREFIX}${data.slug}-`;
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(
          keys.filter((key) => key.startsWith(prefix)).map((key) => caches.delete(key))
        ))
    );
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  if (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/actuator') ||
      url.pathname.startsWith('/platform')) {
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  const slug = tenantFromPath(url.pathname);
  if (!slug) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request, slug));
    return;
  }

  event.respondWith(cacheFirst(request, tenantCache(slug)));
});

function tenantFromPath(pathname) {
  const first = pathname.split('/').filter(Boolean)[0];
  if (!first || RESERVED.includes(first) || !SLUG_RE.test(first)) {
    return null;
  }
  return first;
}

function tenantCache(slug) {
  return `${TENANT_CACHE_PREFIX}${slug}-${VERSION}`;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstNavigation(request, slug) {
  const cache = await caches.open(tenantCache(slug));
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Fallback al shell de la app SPA. El cache es por slug: no hay fuga entre tenants.
    const shell = await caches.match('/index.html');
    if (shell) {
      return shell;
    }
    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
