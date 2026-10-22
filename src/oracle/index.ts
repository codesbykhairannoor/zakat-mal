/**
 * zakat-mal: Pluggable Price & FX Oracle Engine
 * High-performance, zero-dependency rate provider and caching layer.
 * Grounded in Al-Qur'an, Sahih Hadith, and AAOIFI Shari'ah Standard No. 35.
 */

import { D } from '../core/decimal';
import { InvalidInputError } from '../core/errors';

export interface PriceFeedQuote {
  asset: 'gold' | 'silver' | 'unhusked_rice' | 'milled_rice';
  pricePerUnit: string;
  unit: 'gram' | 'kg';
  currency: string;
  timestamp: number;
  source: string;
}

export interface FxQuote {
  from: string;
  to: string;
  rate: string;
  timestamp: number;
  source: string;
}

export interface PriceOracleAdapter {
  name: string;
  fetchPrice(asset: 'gold' | 'silver' | 'unhusked_rice' | 'milled_rice', currency: string): Promise<PriceFeedQuote>;
}

export interface FxOracleAdapter {
  name: string;
  fetchFxRate(from: string, to: string): Promise<FxQuote>;
}

// ISO 4217 Major Currency Definitions
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 0 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2 },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', decimals: 2 },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2 },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', decimals: 3 },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', decimals: 3 }
};

export function isValidCurrency(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return code.toUpperCase() in SUPPORTED_CURRENCIES;
}

export function getCurrencyInfo(code: string): CurrencyInfo {
  const upper = (code || 'USD').toUpperCase();
  return SUPPORTED_CURRENCIES[upper] ?? {
    code: upper,
    name: upper,
    symbol: upper,
    decimals: 2
  };
}

/**
 * Static In-Memory Price Oracle
 * Provides instant, zero-latency rate evaluation with reliable fallback presets.
 */
export class StaticPriceOracle implements PriceOracleAdapter {
  name = 'static_memory_oracle';
  private prices: Map<string, PriceFeedQuote> = new Map();

  constructor(initialQuotes?: PriceFeedQuote[]) {
    // Populate standard benchmarks (Gold ~85 USD/g or ~1.6M IDR/g)
    this.setPrice('gold', 'IDR', '1600000', 'gram', 'antam_benchmark');
    this.setPrice('gold', 'USD', '85.00', 'gram', 'lbma_benchmark');
    this.setPrice('gold', 'SAR', '318.75', 'gram', 'saudi_benchmark');
    this.setPrice('gold', 'MYR', '399.50', 'gram', 'malaysia_benchmark');
    this.setPrice('gold', 'SGD', '114.75', 'gram', 'singapore_benchmark');
    this.setPrice('gold', 'EUR', '78.20', 'gram', 'europe_benchmark');
    this.setPrice('gold', 'AED', '312.10', 'gram', 'uae_benchmark');

    // Silver (~1.00 USD/g or ~19,000 IDR/g)
    this.setPrice('silver', 'IDR', '19000', 'gram', 'silver_benchmark');
    this.setPrice('silver', 'USD', '1.02', 'gram', 'silver_benchmark');
    this.setPrice('silver', 'SAR', '3.82', 'gram', 'silver_benchmark');
    this.setPrice('silver', 'MYR', '4.80', 'gram', 'silver_benchmark');
    this.setPrice('silver', 'SGD', '1.38', 'gram', 'silver_benchmark');

    // Rice for Agriculture Nisab (5 Wasaq = 653 kg grain / 520 kg rice)
    this.setPrice('unhusked_rice', 'IDR', '7500', 'kg', 'pertanian_kemtan');
    this.setPrice('milled_rice', 'IDR', '15000', 'kg', 'beras_medium_kemendag');
    this.setPrice('milled_rice', 'USD', '0.95', 'kg', 'usda_rice_benchmark');
    this.setPrice('milled_rice', 'MYR', '4.20', 'kg', 'beras_malaysia');

    if (initialQuotes) {
      for (const q of initialQuotes) {
        this.prices.set(`${q.asset}:${q.currency.toUpperCase()}`, q);
      }
    }
  }

  setPrice(asset: 'gold' | 'silver' | 'unhusked_rice' | 'milled_rice', currency: string, price: string | number, unit: 'gram' | 'kg' = 'gram', source = 'manual_override') {
    const quote: PriceFeedQuote = {
      asset,
      pricePerUnit: D(price).toFixed(asset === 'gold' || asset === 'silver' ? 2 : 2),
      unit,
      currency: currency.toUpperCase(),
      timestamp: Date.now(),
      source
    };
    this.prices.set(`${asset}:${currency.toUpperCase()}`, quote);
  }

  async fetchPrice(asset: 'gold' | 'silver' | 'unhusked_rice' | 'milled_rice', currency: string): Promise<PriceFeedQuote> {
    const key = `${asset}:${currency.toUpperCase()}`;
    const found = this.prices.get(key);
    if (!found) {
      throw new InvalidInputError(
        `Price quote not found for asset '${asset}' in currency '${currency}'. Provide pricePerUnit explicitly.`,
        'currency'
      );
    }
    return found;
  }
}

/**
 * Static In-Memory FX Oracle
 * Handles cross-currency conversion with arbitrary decimal precision.
 */
export class StaticFxOracle implements FxOracleAdapter {
  name = 'static_fx_oracle';
  private rates: Map<string, FxQuote> = new Map();

  constructor(initialRates?: Record<string, number | string>) {
    // Base rates relative to 1 USD
    const usdEquivalents: Record<string, string> = {
      USD: '1',
      IDR: '16200',
      SAR: '3.75',
      AED: '3.67',
      MYR: '4.45',
      SGD: '1.35',
      EUR: '0.92',
      GBP: '0.78',
      QAR: '3.64',
      TRY: '34.50'
    };

    if (initialRates) {
      Object.assign(usdEquivalents, initialRates);
    }

    // Build all cross pairs
    const codes = Object.keys(usdEquivalents);
    for (const from of codes) {
      for (const to of codes) {
        if (from === to) {
          this.setRate(from, to, '1', 'identity');
        } else {
          const fromPerUsd = D(usdEquivalents[from] ?? '1');
          const toPerUsd = D(usdEquivalents[to] ?? '1');
          const crossRate = toPerUsd.div(fromPerUsd, 8);
          this.setRate(from, to, crossRate.toString(), 'fx_matrix_benchmark');
        }
      }
    }
  }

  setRate(from: string, to: string, rate: number | string, source = 'manual_fx_override') {
    const quote: FxQuote = {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate: D(rate).toString(),
      timestamp: Date.now(),
      source
    };
    this.rates.set(`${from.toUpperCase()}->${to.toUpperCase()}`, quote);
  }

  async fetchFxRate(from: string, to: string): Promise<FxQuote> {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();
    if (fromUpper === toUpper) {
      return {
        from: fromUpper,
        to: toUpper,
        rate: '1',
        timestamp: Date.now(),
        source: 'identity'
      };
    }
    const key = `${fromUpper}->${toUpper}`;
    const found = this.rates.get(key);
    if (!found) {
      throw new InvalidInputError(`Foreign exchange rate not available for pair ${fromUpper}/${toUpper}.`, 'fxRate');
    }
    return found;
  }
}

/**
 * Memory Cache Wrapper for Oracle Providers
 * Enforces caching with configurable TTL (default 1 hour) to protect against network spam.
 */
export class CachedOracle {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private ttlMs: number;

  constructor(ttlMinutes = 60) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  async wrap<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    if (cached && cached.expiry > now) {
      return cached.data as T;
    }
    const fresh = await fetcher();
    this.cache.set(key, { data: fresh, expiry: now + this.ttlMs });
    return fresh;
  }

  clear() {
    this.cache.clear();
  }
}
