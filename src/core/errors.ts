/**
 * zakat-mal: Domain-Specific Error Hierarchy
 */

export class ZakatError extends Error {
  constructor(message: string, public readonly code: string = 'ZAKAT_ERROR') {
    super(message);
    this.name = 'ZakatError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidInputError extends ZakatError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'INVALID_INPUT_ERROR');
    this.name = 'InvalidInputError';
  }
}

export class NisabNotConfiguredError extends ZakatError {
  constructor(message: string) {
    super(message, 'NISAB_NOT_CONFIGURED_ERROR');
    this.name = 'NisabNotConfiguredError';
  }
}
