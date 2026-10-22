import { describe, it, expect } from 'vitest';
import { calculateRikazMiningZakat } from '../src/modules/rikaz-mining';

describe('Rikaz & Mining Zakat Module', () => {
  const goldPrice = 1500000;

  it('calculates 20% flat Khumus on Rikaz (ancient treasure) without nisab threshold', () => {
    const res = calculateRikazMiningZakat({
      type: 'rikaz',
      extractedValue: 50000000 // 50M
    });

    expect(res.isObligatory).toBe(true);
    expect(res.rateApplied).toContain('20.0%');
    // 50M * 0.20 = 10,000,000
    expect(res.zakatDue).toBe('10000000.00');
  });

  it('calculates 2.5% on mining extraction with 85g gold nisab', () => {
    const resBelow = calculateRikazMiningZakat({
      type: 'mining',
      extractedValue: 100000000, // 100M (< 127.5M nisab)
      goldPricePerGram: goldPrice
    });
    expect(resBelow.isObligatory).toBe(false);

    const resAbove = calculateRikazMiningZakat({
      type: 'mining',
      extractedValue: 200000000, // 200M (>= 127.5M)
      goldPricePerGram: goldPrice
    });
    expect(resAbove.isObligatory).toBe(true);
    // 200M * 0.025 = 5,000,000
    expect(resAbove.zakatDue).toBe('5000000.00');
  });
});
