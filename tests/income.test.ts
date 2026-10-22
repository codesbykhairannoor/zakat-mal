import { describe, it, expect } from 'vitest';
import { calculateIncomeZakat } from '../src/modules/income';

describe('Professional Income Zakat Module', () => {
  const goldPrice = 1500000;
  // Annual Nisab = 85 * 1.5M = Rp 127,500,000
  // Monthly Nisab = 127.5M / 12 = Rp 10,625,000

  it('calculates monthly net income method correctly', () => {
    const res = calculateIncomeZakat({
      grossIncome: 20000000, // 20M
      basicLivingExpenses: 6000000, // 6M
      dueDebtInstallment: 2000000, // 2M
      method: 'net',
      period: 'monthly',
      goldPricePerGram: goldPrice,
      calendar: 'hijri'
    });

    // Net income = 20M - 6M - 2M = 12M >= 10,625,000 monthly nisab
    expect(res.details.zakatableBase).toBe('12000000.00');
    expect(res.isObligatory).toBe(true);
    // 12M * 0.025 = 300,000
    expect(res.zakatDue).toBe('300000.00');
  });

  it('supports gross income method without deduction', () => {
    const res = calculateIncomeZakat({
      grossIncome: 15000000,
      method: 'gross',
      period: 'monthly',
      goldPricePerGram: goldPrice,
      calendar: 'hijri'
    });

    expect(res.details.zakatableBase).toBe('15000000.00');
    expect(res.isObligatory).toBe(true);
    // 15M * 0.025 = 375,000
    expect(res.zakatDue).toBe('375000.00');
  });

  it('marks as not obligatory if net income is below monthly nisab', () => {
    const res = calculateIncomeZakat({
      grossIncome: 12000000,
      basicLivingExpenses: 5000000, // 12M - 5M = 7M < 10.625M nisab
      method: 'net',
      period: 'monthly',
      goldPricePerGram: goldPrice
    });

    expect(res.isObligatory).toBe(false);
    expect(parseFloat(res.zakatDue)).toBe(0);
  });
});
