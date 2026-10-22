import { describe, it, expect } from 'vitest';
import { calculateInvestmentsZakat, calculateCryptoZakat } from '../src/modules/investments';

describe('Investments & Crypto Zakat Module', () => {
  const goldPrice = 1500000;
  // Nisab = 85 * 1.5M = 127.5M

  it('calculates active trading stocks and 10% dividend income', () => {
    const res = calculateInvestmentsZakat({
      tradingStocksValue: 150000000, // 150M (> 127.5M) -> 2.5% = 3,750,000
      longTermDividendIncome: 20000000, // 20M -> 10% = 2,000,000
      goldPricePerGram: goldPrice,
      calendar: 'hijri'
    });

    expect(res.isObligatory).toBe(true);
    expect(res.details.tradingStocksZakatDue).toBe('3750000.00');
    expect(res.details.dividendZakatDue).toBe('2000000.00');
    // Total = 3,750,000 + 2,000,000 = 5,750,000
    expect(res.zakatDue).toBe('5750000.00');
  });

  it('calculates crypto assets evaluated at gold nisab', () => {
    const res = calculateCryptoZakat({
      portfolioValue: 10000, // $10,000
      goldPricePerGram: 75, // $75/g -> Nisab = 85 * 75 = $6,375
      calendar: 'hijri'
    });

    expect(res.isObligatory).toBe(true);
    // $10,000 * 0.025 = $250
    expect(res.zakatDue).toBe('250.00');
  });
});
