import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { TenantInfo } from '../models/models';

const hex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

const BG = hex(236, 231, 223);
const WHITE = hex(255, 255, 255);
const INK = hex(21, 19, 16);
const GREY = hex(119, 119, 119);
const ACCENT = hex(166, 58, 18);
const CARD_TO = hex(58, 52, 43);

function luminance(hex: string): number {
  const value = parseInt(hex.replace('#', ''), 16);
  const channels = [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff].map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function tenant(overrides: Partial<TenantInfo> = {}): TenantInfo {
  return {
    slug: 'cafe-a',
    name: 'Cafe A',
    status: 'ACTIVE',
    colorPrimary: null,
    colorSecondary: null,
    logoUrl: null,
    backgroundUrl: null,
    backgroundVisibility: 20,
    backgroundBlur: 8,
    ...overrides
  };
}

describe('ThemeService', () => {
  let service: ThemeService;

  const clearRoot = () => {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    root.removeAttribute('data-theme-mode');
    root.removeAttribute('data-tenant-bg');
    [
      '--color-accent', '--color-accent-hover', '--color-accent-contrast', '--color-focus',
      '--loyalty-card-to', '--loyalty-card-text', '--loyalty-card-muted',
      '--tenant-glass-blur', '--tenant-glass-overlay',
      '--color-bg', '--neutral-0', '--neutral-950'
    ].forEach(variable => root.style.removeProperty(variable));
    document.body.style.removeProperty('background-image');
    document.body.style.removeProperty('background-size');
    document.body.style.removeProperty('background-attachment');
    document.body.style.removeProperty('background-position');
    document.body.style.removeProperty('background-repeat');
    root.style.setProperty('--color-bg', BG);
    root.style.setProperty('--neutral-0', WHITE);
    root.style.setProperty('--neutral-950', INK);
  };

  beforeEach(() => {
    localStorage.clear();
    clearRoot();

    spyOn(window, 'matchMedia').and.callFake((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false
    }) as unknown as MediaQueryList);

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    clearRoot();
  });

  it('init aplica el tema claro cuando system no prefiere oscuro', () => {
    service.init();

    expect(document.documentElement.dataset['theme']).toBe('light-neumorphic');
    expect(document.documentElement.dataset['themeMode']).toBe('system');
  });

  it('setMode persiste y aplica un tema oscuro', () => {
    service.init();
    service.setMode('deep-ocean');

    expect(localStorage.getItem('loyalty.theme')).toBe('deep-ocean');
    expect(document.documentElement.dataset['theme']).toBe('deep-ocean');
    expect(service.isDark()).toBeTrue();
  });

  it('toggle alterna desde un tema oscuro al claro base', () => {
    service.init();
    service.setMode('warm-ember');
    service.toggle();

    expect(localStorage.getItem('loyalty.theme')).toBe('light-neumorphic');
    expect(service.isDark()).toBeFalse();
  });

  it('migra el modo viejo light/dark a los ids nuevos', () => {
    localStorage.setItem('loyalty.theme', 'dark');
    service.init();

    expect(document.documentElement.dataset['theme']).toBe('dark-purple');
    expect(document.documentElement.dataset['themeMode']).toBe('dark-purple');
  });

  it('ajusta el acento del tenant hasta cumplir AA contra el fondo', () => {
    service.init();
    service.apply(tenant({ colorPrimary: GREY }));

    const accent = document.documentElement.style.getPropertyValue('--color-accent');

    expect(accent).not.toBe('');
    expect(accent).not.toBe(GREY);
    expect(contrast(accent, BG)).toBeGreaterThanOrEqual(4.5);
  });

  it('reset limpia el branding sin tocar el tema', () => {
    service.init();
    service.setMode('dark-purple');
    service.apply(tenant({ colorPrimary: ACCENT, colorSecondary: CARD_TO }));

    expect(document.documentElement.style.getPropertyValue('--color-accent')).not.toBe('');

    service.reset();

    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('');
    expect(document.documentElement.dataset['theme']).toBe('dark-purple');
  });

  it('aplica fondo y controles de vidrio al tenant', () => {
    service.init();
    service.apply(tenant({
      backgroundUrl: '/api/files/backgrounds/fondo.png',
      backgroundVisibility: 35,
      backgroundBlur: 12
    }));

    expect(document.documentElement.dataset['tenantBg']).toBe('true');
    expect(document.documentElement.style.getPropertyValue('--tenant-glass-blur')).toBe('12px');
    expect(document.body.style.backgroundImage).toContain('fondo.png');
    expect(document.body.style.backgroundImage).toContain('var(--page-wash)');

    service.reset();

    expect(document.documentElement.dataset['tenantBg']).toBe('false');
    expect(document.body.style.backgroundImage).toBe('');
  });
});
