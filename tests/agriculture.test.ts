import { describe, it, expect } from 'vitest';
import { calculateAgricultureZakat } from '../src/modules/agriculture';

describe('Agriculture & Crops Zakat Module', () => {
  it('applies 10% rate for rain-fed / natural spring irrigation', () => {
    // 1000 kg unhusked grain (gabah), nisab = 653 kg
    const res = calculateAgricultureZakat({
      harvestWeightKg: 1000,
      irrigation: 'natural',
      produceType: 'grain_unhusked'
    });

    expect(res.isObligatory).toBe(true);
    expect(res.rateApplied).toContain('10.0%');
    // 1000 * 0.10 = 100 kg
    expect(res.details.zakatDueKg).toBe('100.00');
  });

  it('applies 5% rate for artificial irrigation / pumps / purchased water', () => {
    const res = calculateAgricultureZakat({
      harvestWeightKg: 1000,
      irrigation: 'artificial',
      produceType: 'grain_unhusked'
    });

    expect(res.isObligatory).toBe(true);
    expect(res.rateApplied).toContain('5.0%');
    // 1000 * 0.05 = 50 kg
    expect(res.details.zakatDueKg).toBe('50.00');
  });

  it('applies 7.5% rate for mixed irrigation', () => {
    const res = calculateAgricultureZakat({
      harvestWeightKg: 1000,
      irrigation: 'mixed'
    });

    expect(res.isObligatory).toBe(true);
    expect(res.rateApplied).toContain('7.5%');
    // 1000 * 0.075 = 75 kg
    expect(res.details.zakatDueKg).toBe('75.00');
  });

  it('uses 520 kg nisab for clean milled rice (beras)', () => {
    const resBelow = calculateAgricultureZakat({
      harvestWeightKg: 500,
      irrigation: 'artificial',
      produceType: 'rice_clean'
    });
    expect(resBelow.isObligatory).toBe(false);

    const resAbove = calculateAgricultureZakat({
      harvestWeightKg: 600,
      irrigation: 'artificial',
      produceType: 'rice_clean',
      pricePerKg: 15000 // Rp 15.000 / kg
    });
    expect(resAbove.isObligatory).toBe(true);
    // 600 * 0.05 = 30 kg
    expect(resAbove.details.zakatDueKg).toBe('30.00');
    // 30 * 15,000 = 450,000
    expect(resAbove.details.zakatDueMonetary).toBe('450000.00');
  });

  it('deducts operational expenses if specified', () => {
    const res = calculateAgricultureZakat({
      harvestWeightKg: 800,
      operationalCostsDeduction: 200, // net = 600 kg (< 653 kg gabah nisab)
      irrigation: 'natural',
      produceType: 'grain_unhusked'
    });
    expect(res.isObligatory).toBe(false);
  });
});
