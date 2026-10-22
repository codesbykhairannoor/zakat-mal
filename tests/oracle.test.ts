import { describe, it, expect } from 'vitest';
import {
  StaticPriceOracle,
  StaticFxOracle,
  CachedOracle,
  isValidCurrency,
  getCurrencyInfo
} from '../src/oracle';

describe('Oracle & FX Engine', () => {
  it('validates supported ISO currencies', () => {
    expect(isValidCurrency('USD')).toBe(true);
    expect(isValidCurrency('IDR')).toBe(true);
    expect(isValidCurrency('SAR')).toBe(true);
    expect(isValidCurrency('MYR')).toBe(true);
    expect(isValidCurrency('INVALID_CURRENCY')).toBe(false);
  });

  it('retrieves accurate currency metadata', () => {
    const idr = getCurrencyInfo('IDR');
    expect(idr.decimals).toBe(0);
    expect(idr.symbol).toBe('Rp');

    const usd = getCurrencyInfo('USD');
    expect(usd.decimals).toBe(2);
    expect(usd.symbol).toBe('$');
  });

  it('fetches static benchmark gold and silver prices', async () => {
    const oracle = new StaticPriceOracle();

    const goldIdr = await oracle.fetchPrice('gold', 'IDR');
    expect(goldIdr.pricePerUnit).toBe('1600000.00');
    expect(goldIdr.unit).toBe('gram');

    const goldUsd = await oracle.fetchPrice('gold', 'USD');
    expect(goldUsd.pricePerUnit).toBe('85.00');

    const silverUsd = await oracle.fetchPrice('silver', 'USD');
    expect(silverUsd.pricePerUnit).toBe('1.02');
  });

  it('allows setting custom manual price overrides', async () => {
    const oracle = new StaticPriceOracle();
    oracle.setPrice('gold', 'SAR', '350.50', 'gram', 'custom_saudi_rate');

    const saudiGold = await oracle.fetchPrice('gold', 'SAR');
    expect(saudiGold.pricePerUnit).toBe('350.50');
    expect(saudiGold.source).toBe('custom_saudi_rate');
  });

  it('computes cross FX rates accurately with Decimal precision', async () => {
    const fx = new StaticFxOracle();

    const identity = await fx.fetchFxRate('USD', 'USD');
    expect(identity.rate).toBe('1');

    const usdToIdr = await fx.fetchFxRate('USD', 'IDR');
    expect(usdToIdr.rate).toBe('16200');

    // Cross rate: 1 SAR = ~4320 IDR (16200 / 3.75)
    const sarToIdr = await fx.fetchFxRate('SAR', 'IDR');
    expect(parseFloat(sarToIdr.rate)).toBeCloseTo(4320, 0);
  });

  it('caches oracle queries with TTL', async () => {
    const cached = new CachedOracle(60);
    let counter = 0;

    const fetchMock = async () => {
      counter++;
      return { val: 42 };
    };

    const first = await cached.wrap('key1', fetchMock);
    const second = await cached.wrap('key1', fetchMock);

    expect(first.val).toBe(42);
    expect(second.val).toBe(42);
    expect(counter).toBe(1); // Cached, called only once!
  });
});
