import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

/**
 * Fechas con el locale del idioma activo: `es-AR` para español y `en-US` para inglés.
 * `LOCALE_ID` es estático y la app permite cambiar de idioma en runtime, por eso el pipe.
 */
@Pipe({ name: 'appDate', standalone: true, pure: false })
export class AppDatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: string | Date | null | undefined, format = 'short'): string | null {
    if (!value) {
      return null;
    }
    const locale = this.translate.currentLang === 'es' ? 'es-AR' : 'en-US';
    return new DatePipe(locale).transform(value, format);
  }
}
