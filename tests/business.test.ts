import { describe, it, expect } from 'vitest';
import { calculateBusinessZakat } from '../src/modules/business';

describe('Business Merchandise Zakat Module (\'Urud at-Tijarah)', () => {
  const goldPrice = 1500000;
  // Nisab = 85 * 1.5M = 127.5M

  it('calculates trade inventory, cash, receivables minus operational payables', () => {
    const res = calculateBusinessZakat({
      cashAndLiquidAssets: 30000000, // 30M
      inventoryMarketValue: 120000000, // 120M
      goodReceivables: 20000000, // 20M
      dueOperationalDebts: 20000000, // 20M
      goldPricePerGram: goldPrice
    });

    // Net working capital = 30 + 120 + 20 - 20 = 150M >= 127.5M nisab
    expect(res.details.netWorkingCapitalBase).toBe('150000000.00');
    expect(res.isObligatory).toBe(true);
    // 150M * 0.025 = 3,750,000
    expect(res.zakatDue).toBe('3750000.00');
  });

  it('returns zero zakat if net working capital is below gold nisab', () => {
    const res = calculateBusinessZakat({
      cashAndLiquidAssets: 10000000,
      inventoryMarketValue: 80000000,
      goodReceivables: 10000000,
      dueOperationalDebts: 0,
      goldPricePerGram: goldPrice
    });
    // Base = 100M < 127.5M nisab
    expect(res.isObligatory).toBe(false);
    expect(parseFloat(res.zakatDue)).toBe(0);
  });
});
