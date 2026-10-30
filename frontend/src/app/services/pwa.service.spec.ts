import { TestBed } from '@angular/core/testing';
import { PwaService } from './pwa.service';

describe('PwaService', () => {
  let service: PwaService;
  let postMessage: jasmine.Spy;
  let originalDescriptor: PropertyDescriptor | undefined;

  const setController = (controller: unknown) => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: controller === undefined ? undefined : { controller }
    });
  };

  beforeAll(() => {
    originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
  });

  afterAll(() => {
    if (originalDescriptor) {
      Object.defineProperty(navigator, 'serviceWorker', originalDescriptor);
    } else {
      delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
    }
  });

  beforeEach(() => {
    postMessage = jasmine.createSpy('postMessage');
    setController({ postMessage });

    TestBed.configureTestingModule({});
    service = TestBed.inject(PwaService);
  });

  it('invalida la cache del tenant por postMessage', () => {
    service.clearTenantCache('cafe-a');

    expect(postMessage).toHaveBeenCalledWith({ type: 'CLEAR_TENANT', slug: 'cafe-a' });
  });

  it('no envia nada si no hay slug', () => {
    service.clearTenantCache(null);

    expect(postMessage).not.toHaveBeenCalled();
  });

  it('no envia nada si no hay service worker controlando la pagina', () => {
    setController(null);

    service.clearTenantCache('cafe-a');

    expect(postMessage).not.toHaveBeenCalled();
  });
});
