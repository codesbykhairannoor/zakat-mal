import { describe, it, expect } from 'vitest';
import { calculateCorporateZakat } from '../src/modules/corporate';

describe('Corporate Zakat Module (AAOIFI Shari\'ah Standard No. 35)', () => {
  const goldPrice = 1500000;
  // Nisab = 85 * 1.5M = 127.5M

  it('calculates Net Working Capital approach correctly', () => {
    const res = calculateCorporateZakat({
      method: 'net_working_capital',
      currentAssets: 500000000, // 500M
      nonZakatableCurrentAssets: 50000000, // 50M
      currentLiabilities: 150000000, // 150M
      muslimOwnershipPercentage: 100,
      goldPricePerGram: goldPrice,
      calendar: 'hijri'
    });

    // Base = (500M - 50M) - 150M = 300M >= 127.5M
    expect(res.details.muslimZakatableBase).toBe('300000000.00');
    expect(res.isObligatory).toBe(true);
    // 300M * 0.025 = 7.5M
    expect(res.zakatDue).toBe('7500000.00');
  });

  it('calculates Net Equity approach correctly', () => {
    const res = calculateCorporateZakat({
      method: 'net_equity',
      paidUpCapital: 200000000, // 200M
      reserves: 50000000, // 50M
      retainedEarnings: 100000000, // 100M
      longTermDebt: 50000000, // 50M (Total Equity/Financing = 400M)
      netFixedAssets: 80000000, // 80M
      longTermInvestments: 20000000, // 20M (Total Deductions = 100M)
      muslimOwnershipPercentage: 100,
      goldPricePerGram: goldPrice,
      calendar: 'hijri'
    });

    // Base = 400M - 100M = 300M
    expect(res.details.muslimZakatableBase).toBe('300000000.00');
    expect(res.isObligatory).toBe(true);
    expect(res.zakatDue).toBe('7500000.00');
  });

  it('adjusts for non-Muslim equity share', () => {
    const res = calculateCorporateZakat({
      method: 'net_working_capital',
      currentAssets: 1000000000, // 1 Billion
      currentLiabilities: 200000000, // 200M (Base = 800M)
      muslimOwnershipPercentage: 60, // 60% Muslim shareholders
      goldPricePerGram: goldPrice,
      calendar: 'hijri'
    });

    // 800M * 0.60 = 480M
    expect(res.details.muslimZakatableBase).toBe('480000000.00');
    // 480M * 0.025 = 12M
    expect(res.zakatDue).toBe('12000000.00');
  });

  it('applies solar 2.577% rate under Gregorian fiscal year', () => {
    const res = calculateCorporateZakat({
      currentAssets: 1000000000,
      currentLiabilities: 0,
      goldPricePerGram: goldPrice,
      calendar: 'gregorian'
    });

    expect(res.rateApplied).toContain('2.577%');
    // 1B * 0.02577 = 25,770,000
    expect(res.zakatDue).toBe('25770000.00');
  });
});
