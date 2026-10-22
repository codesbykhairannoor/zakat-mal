import { describe, it, expect } from 'vitest';
import { calculateCashSavingsZakat } from '../src/modules/cash-savings';

describe('Cash, Savings & Bank Deposits Zakat Module', () => {
  const goldPrice = 1500000;
  // Nisab = 85 * 1,500,000 = Rp 127,500,000

  it('calculates aggregated cash, deposits, and accounts correctly', () => {
    const res = calculateCashSavingsZakat({
      cashInHand: 10000000, // 10M
      bankSavings: 100000000, // 100M
      timeDeposits: 50000000, // 50M
      goldPricePerGram: goldPrice
    });
    // Gross = 160M >= 127.5M nisab
    expect(res.isObligatory).toBe(true);
    expect(res.zakatableAmount).toBe('160000000.00');
    // 160M * 0.025 = 4M
    expect(res.zakatDue).toBe('4000000.00');
  });

  it('deducts immediate due debts from gross liquid balance', () => {
    const res = calculateCashSavingsZakat({
      bankSavings: 150000000, // 150M
      immediateDueDebts: 40000000, // 40M debt due
      goldPricePerGram: goldPrice
    });
    // Net = 110M < 127.5M nisab
    expect(res.details.netZakatableBase).toBe('110000000.00');
    expect(res.isObligatory).toBe(false);
    expect(parseFloat(res.zakatDue)).toBe(0);
  });

  it('respects Hawl fulfillment check', () => {
    const res = calculateCashSavingsZakat({
      bankSavings: 200000000,
      goldPricePerGram: goldPrice,
      isHawlFulfilled: false
    });
    expect(res.isObligatory).toBe(false);
    expect(parseFloat(res.zakatDue)).toBe(0);
    expect(res.notes.some((n) => n.toLowerCase().includes('hawl'))).toBe(true);

    const resId = calculateCashSavingsZakat({
      bankSavings: 200000000,
      goldPricePerGram: goldPrice,
      isHawlFulfilled: false,
      locale: 'id'
    });
    expect(resId.notes.some((n) => n.includes('haul'))).toBe(true);
  });

  it('supports Silver nisab option per Hanafi school', () => {
    const res = calculateCashSavingsZakat({
      bankSavings: 15000000, // 15M
      useSilverNisab: true,
      silverPricePerGram: 18000, // 595 * 18,000 = 10,710,000
      goldPricePerGram: goldPrice
    });
    expect(res.details.nisabStandardUsed).toBe('silver_595g');
    expect(res.details.nisabMonetaryValue).toBe('10710000.00');
    expect(res.isObligatory).toBe(true);
  });
});
