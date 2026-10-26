import { describe, it, expect } from 'vitest';
import { calculateGoldSilverZakat } from '../src/modules/gold-silver';

describe('Gold & Silver Zakat Module', () => {
  const goldPrice = 1500000; // Rp 1.500.000 / gram
  const silverPrice = 18000; // Rp 18.000 / gram

  it('declares 84.99g gold below nisab and 85g gold as obligatory', () => {
    const below = calculateGoldSilverZakat({
      goldGrams: 84.99,
      goldPricePerGram: goldPrice
    });
    expect(below.isObligatory).toBe(false);
    expect(below.details.isGoldNisabReached).toBe(false);
    expect(parseFloat(below.details.goldZakatDueGrams)).toBe(0);

    const exact = calculateGoldSilverZakat({
      goldGrams: 85,
      goldPricePerGram: goldPrice
    });
    expect(exact.isObligatory).toBe(true);
    expect(exact.details.isGoldNisabReached).toBe(true);
    // 85 * 0.025 = 2.125 grams
    expect(exact.details.goldZakatDueGrams).toBe('2.1250');
    // 2.125 * 1,500,000 = 3,187,500
    expect(exact.details.goldZakatDueMonetary).toBe('3187500.00');
  });

  it('calculates gold purity correctly for 18 karat gold (18/24 = 75% purity)', () => {
    // 100g of 18K gold contains 75g of pure gold (< 85g nisab)
    const res = calculateGoldSilverZakat({
      goldGrams: 100,
      goldPurityKarat: 18,
      goldPricePerGram: goldPrice
    });
    expect(res.details.pureGoldWeightGrams).toBe('75.0000');
    expect(res.isObligatory).toBe(false);

    // 120g of 18K gold contains 90g of pure gold (> 85g nisab)
    const res2 = calculateGoldSilverZakat({
      goldGrams: 120,
      goldPurityKarat: 18,
      goldPricePerGram: goldPrice
    });
    expect(res2.details.pureGoldWeightGrams).toBe('90.0000');
    expect(res2.isObligatory).toBe(true);
    // 90g * 0.025 = 2.25g
    expect(res2.details.goldZakatDueGrams).toBe('2.2500');
  });

  it('exempts customary personal jewelry per Jumhur opinion', () => {
    const res = calculateGoldSilverZakat({
      goldGrams: 100,
      goldUsage: 'personal',
      goldPricePerGram: goldPrice
    });
    expect(res.isObligatory).toBe(false);
    expect(parseFloat(res.details.goldZakatDueGrams)).toBe(0);
    expect(res.notes.some((n) => n.toLowerCase().includes('jewelry'))).toBe(true);

    const resId = calculateGoldSilverZakat({
      goldGrams: 100,
      goldUsage: 'personal',
      goldPricePerGram: goldPrice,
      locale: 'id'
    });
    expect(resId.notes.some((n) => n.includes('perhiasan'))).toBe(true);
  });

  it('evaluates silver at 595g nisab', () => {
    const silverBelow = calculateGoldSilverZakat({
      silverGrams: 590,
      silverPricePerGram: silverPrice
    });
    expect(silverBelow.isObligatory).toBe(false);

    const silverExact = calculateGoldSilverZakat({
      silverGrams: 600,
      silverPricePerGram: silverPrice
    });
    expect(silverExact.isObligatory).toBe(true);
    // 600 * 0.025 = 15 grams silver
    expect(silverExact.details.silverZakatDueGrams).toBe('15.0000');
    // 15 * 18,000 = 270,000
    expect(silverExact.details.silverZakatDueMonetary).toBe('270000.00');
  });

  it('adjusts rate to 2.577% under Gregorian calendar per AAOIFI', () => {
    const res = calculateGoldSilverZakat({
      goldGrams: 100,
      goldPricePerGram: goldPrice,
      calendar: 'gregorian'
    });
    expect(res.rateApplied).toBe('2.577%');
    // 100 * 0.02577 = 2.577g
    expect(res.details.goldZakatDueGrams).toBe('2.5770');
  });

  it('calculates zakat on personal gold jewelry under Hanafi madhhab', () => {
    const res = calculateGoldSilverZakat({
      goldGrams: 100,
      goldUsage: 'personal',
      madhhab: 'hanafi',
      goldPricePerGram: goldPrice
    });
    // Under Hanafi: personal jewelry >= 85g is 100% zakatable!
    expect(res.isObligatory).toBe(true);
    expect(res.details.goldZakatDueGrams).toBe('2.5000');
    expect(res.details.goldZakatDueMonetary).toBe('3750000.00');
    expect(res.notes.some((n) => n.toLowerCase().includes('hanafi'))).toBe(true);
  });

  it('throws InvalidInputError on negative gold price', () => {
    expect(() =>
      calculateGoldSilverZakat({
        goldGrams: 100,
        goldPricePerGram: -500
      })
    ).toThrow();
  });

  it('includes authentic Dalil references in the output', () => {
    const res = calculateGoldSilverZakat({
      goldGrams: 100,
      goldPricePerGram: goldPrice
    });
    expect(res.dalilReferences.length).toBeGreaterThanOrEqual(3);
    expect(res.dalilReferences.some((d) => d.id === 'hadith_abu_dawud_1573')).toBe(true);
  });
});
