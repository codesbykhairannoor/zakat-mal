import { describe, it, expect } from 'vitest';
import { calculateRentalYieldZakat } from '../src/modules/rental-yield';

describe('Rental Property & Productive Assets (Al-Mustaghallat) Module', () => {
  const goldPrice = 1500000;
  // Annual Nisab = 85 * 1.5M = 127.5M

  it('calculates 10% on net rental yield upon receipt', () => {
    const res = calculateRentalYieldZakat({
      grossRentalRevenue: 200000000, // 200M
      maintenanceAndTaxes: 50000000, // 50M -> Net = 150M >= 127.5M
      method: 'receipt_10_percent',
      goldPricePerGram: goldPrice
    });

    expect(res.isObligatory).toBe(true);
    expect(res.rateApplied).toContain('10.0%');
    // 150M * 0.10 = 15,000,000
    expect(res.zakatDue).toBe('15000000.00');
  });

  it('calculates 2.5% on annual accumulated surplus', () => {
    const res = calculateRentalYieldZakat({
      grossRentalRevenue: 200000000,
      maintenanceAndTaxes: 50000000,
      method: 'annual_surplus_2_5_percent',
      goldPricePerGram: goldPrice,
      calendar: 'hijri'
    });

    expect(res.isObligatory).toBe(true);
    expect(res.rateApplied).toBe('2.5%');
    // 150M * 0.025 = 3,750,000
    expect(res.zakatDue).toBe('3750000.00');
  });
});
