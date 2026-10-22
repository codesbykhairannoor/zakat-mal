import { describe, it, expect } from 'vitest';
import { calculatePortfolioZakat } from '../src/engine/calculator';

describe('Unified Portfolio Zakat Calculator', () => {
  const goldPrice = 1500000;

  it('aggregates multiple asset categories and produces comprehensive breakdown', () => {
    const portfolio = calculatePortfolioZakat({
      goldSilver: {
        goldGrams: 100, // 100g 24K -> 2.5g due = 3,750,000
        goldPricePerGram: goldPrice,
        calendar: 'hijri'
      },
      cashSavings: {
        bankSavings: 200000000, // 200M -> 2.5% = 5,000,000
        goldPricePerGram: goldPrice,
        calendar: 'hijri'
      },
      income: {
        grossIncome: 25000000, // 25M
        basicLivingExpenses: 8000000, // 8M -> net = 17M -> 2.5% = 425,000
        goldPricePerGram: goldPrice,
        period: 'monthly',
        method: 'net',
        calendar: 'hijri'
      },
      currency: 'IDR'
    });

    expect(portfolio.itemsCalculatedCount).toBe(3);
    expect(portfolio.obligatoryCount).toBe(3);

    // Total = 3,750,000 + 5,000,000 + 425,000 = 9,175,000
    expect(portfolio.totalZakatDueMonetary).toBe('9175000.00');
    expect(portfolio.allDalilReferences.length).toBeGreaterThan(0);
    expect(portfolio.summaryNotes.length).toBeGreaterThan(0);
  });
});
