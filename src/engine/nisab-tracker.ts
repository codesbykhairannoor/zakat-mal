/**
 * zakat-mal: Dynamic Nisab Tracker and Currency Converter
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { NisabConfig } from '../types/common';
import { InvalidInputError } from '../core/errors';

export class NisabTracker {
  private goldPricePerGram: Decimal;
  private silverPricePerGram: Decimal;
  private unhuskedRicePricePerKg: Decimal;
  private milledRicePricePerKg: Decimal;
  private currency: string;

  private goldNisabGrams: Decimal;
  private silverNisabGrams: Decimal;
  private grainNisabKg: Decimal;
  private riceNisabKg: Decimal;
  private locale: string;

  constructor(config: NisabConfig = {}) {
    this.locale = config.locale ?? 'en';
    this.currency = config.currency ?? (config.locale === 'id' ? 'IDR' : 'USD');
    this.goldPricePerGram = D(config.goldPricePerGram ?? 0);
    this.silverPricePerGram = D(config.silverPricePerGram ?? 0);
    this.unhuskedRicePricePerKg = D(config.unhuskedRicePricePerKg ?? 0);
    this.milledRicePricePerKg = D(config.milledRicePricePerKg ?? 0);

    this.goldNisabGrams = D(config.customGoldNisabGrams ?? ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS);
    this.silverNisabGrams = D(config.customSilverNisabGrams ?? ISLAMIC_CONSTANTS.NISAB_SILVER_GRAMS);
    this.grainNisabKg = D(config.customGrainNisabKg ?? ISLAMIC_CONSTANTS.NISAB_GRAIN_UNHUSKED_KG);
    this.riceNisabKg = D(config.customRiceNisabKg ?? ISLAMIC_CONSTANTS.NISAB_RICE_MILLED_KG);
  }

  public getGoldNisabGrams(): Decimal {
    return this.goldNisabGrams;
  }

  public getSilverNisabGrams(): Decimal {
    return this.silverNisabGrams;
  }

  public getGoldNisabMonetaryValue(pricePerGram?: number | string): Decimal {
    const price = pricePerGram !== undefined ? D(pricePerGram) : this.goldPricePerGram;
    if (price.isZero() || price.isNegative()) {
      throw new InvalidInputError('Harga emas per gram harus lebih besar dari 0 untuk menghitung nilai moneter nisab emas.', 'goldPricePerGram');
    }
    return this.goldNisabGrams.mul(price);
  }

  public getSilverNisabMonetaryValue(pricePerGram?: number | string): Decimal {
    const price = pricePerGram !== undefined ? D(pricePerGram) : this.silverPricePerGram;
    if (price.isZero() || price.isNegative()) {
      throw new InvalidInputError('Harga perak per gram harus lebih besar dari 0 untuk menghitung nilai moneter nisab perak.', 'silverPricePerGram');
    }
    return this.silverNisabGrams.mul(price);
  }

  public getMonthlyIncomeNisabMonetaryValue(pricePerGram?: number | string): Decimal {
    const annual = this.getGoldNisabMonetaryValue(pricePerGram);
    return annual.div(12, 4);
  }

  public getGrainNisabKg(): Decimal {
    return this.grainNisabKg;
  }

  public getRiceNisabKg(): Decimal {
    return this.riceNisabKg;
  }

  public getAgricultureNisabMonetaryValue(produceType: 'grain_unhusked' | 'rice_clean' = 'rice_clean', pricePerKg?: number | string): Decimal {
    const isRice = produceType === 'rice_clean';
    const weight = isRice ? this.riceNisabKg : this.grainNisabKg;
    const defaultPrice = isRice ? this.milledRicePricePerKg : this.unhuskedRicePricePerKg;
    const price = pricePerKg !== undefined ? D(pricePerKg) : defaultPrice;

    if (price.isZero() || price.isNegative()) {
      throw new InvalidInputError(`Harga per kg ${isRice ? 'beras' : 'gabah'} harus > 0`, 'pricePerKg');
    }
    return weight.mul(price);
  }

  public getCurrency(): string {
    return this.currency;
  }

  public getLocale(): string {
    return this.locale;
  }
}
