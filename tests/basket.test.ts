import { describe, it, expect } from 'vitest';
import { calculateMultiCurrencyBasketZakat } from '../src/basket';
import { StaticFxOracle, StaticPriceOracle } from '../src/oracle';

describe('Multi-Currency Asset Basket & FX Auto-Conversion Engine', () => {
  it('consolidates multi-currency assets into base IDR and calculates Zakat correctly', async () => {
    const fx = new StaticFxOracle({
      USD: '1',
      IDR: '16000',
      SAR: '4.0' // 1 SAR = 4000 IDR
    });

    const price = new StaticPriceOracle();
    // 85g gold * 1,500,000 = 127,500,000 IDR nisab
    price.setPrice('gold', 'IDR', '1500000', 'gram');

    const result = await calculateMultiCurrencyBasketZakat({
      targetCurrency: 'IDR',
      fxOracle: fx,
      priceOracle: price,
      goldPriceInTargetCurrency: 1500000,
      assets: [
        {
          name: 'US Dollar Cash',
          category: 'cash_savings',
          amount: 5000, // 5,000 USD * 16,000 = 80,000,000 IDR
          currency: 'USD'
        },
        {
          name: 'Bank Mandiri Savings',
          category: 'cash_savings',
          amount: 50000000, // 50,000,000 IDR
          currency: 'IDR'
        },
        {
          name: 'Saudi Al-Rajhi Account',
          category: 'cash_savings',
          amount: 10000, // 10,000 SAR * 4,000 = 40,000,000 IDR
          currency: 'SAR'
        }
      ]
    });

    // Total = 80M + 50M + 40M = 170,000,000 IDR
    // Nisab = 85 * 1.5M = 127,500,000 IDR
    // 170M >= 127.5M -> Wajib Zakat!
    // Zakat = 170M * 2.5% = 4,250,000 IDR
    expect(result.isNisabReached).toBe(true);
    expect(result.totalZakatableBaseTargetCurrency).toBe('170000000.00');
    expect(result.goldNisabValueTargetCurrency).toBe('127500000.00');
    expect(result.totalZakatDueTargetCurrency).toBe('4250000');
    expect(result.convertedItems.length).toBe(3);
  });

  it('excludes assets where hawl is incomplete from current due liability', async () => {
    const result = await calculateMultiCurrencyBasketZakat({
      targetCurrency: 'USD',
      goldPriceInTargetCurrency: 80,
      assets: [
        {
          name: 'Mature Savings',
          category: 'cash_savings',
          amount: 10000,
          currency: 'USD',
          isHawlFulfilled: true
        },
        {
          name: 'Recent Inheritance (3 months held)',
          category: 'cash_savings',
          amount: 20000,
          currency: 'USD',
          isHawlFulfilled: false
        }
      ]
    });

    // Only mature savings (10,000) considered
    // Nisab = 85 * 80 = 6,800 USD
    // 10,000 >= 6,800 -> Zakat = 10,000 * 2.5% = 250.00 USD
    expect(result.totalZakatableBaseTargetCurrency).toBe('10000.00');
    expect(result.isNisabReached).toBe(true);
    expect(result.totalZakatDueTargetCurrency).toBe('250.00');
  });
});
