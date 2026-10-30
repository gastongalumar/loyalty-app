import { Business, LoyaltyCard } from '../models/models';

/**
 * Traduce estados del backend sin exponer enums crudos en la UI.
 * Devuelve una clave de i18n (o el valor original si es desconocido).
 */
export function businessStatusKey(status: Business['status'] | string): string {
  switch (status) {
    case 'ACTIVE':
      return 'STATUS.ACTIVE';
    case 'SUSPENDED':
      return 'STATUS.SUSPENDED';
    case 'DELETED':
      return 'STATUS.DELETED';
    default:
      return status;
  }
}

export function cardStatusKey(status: LoyaltyCard['status'] | string): string {
  switch (status) {
    case 'REWARD_PENDING':
      return 'CUSTOMER.REWARD_READY';
    case 'COMPLETED':
      return 'CUSTOMER.STATUS_COMPLETED';
    case 'ACTIVE':
      return 'CUSTOMER.STATUS_ACTIVE';
    default:
      return status;
  }
}

/** Clase semántica para pintar el estado del negocio. */
export function businessStatusTone(status: Business['status'] | string): string {
  switch (status) {
    case 'ACTIVE':
      return 'is-active';
    case 'SUSPENDED':
      return 'is-suspended';
    case 'DELETED':
      return 'is-deleted';
    default:
      return '';
  }
}
