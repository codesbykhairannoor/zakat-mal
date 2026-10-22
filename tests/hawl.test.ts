import { describe, it, expect } from 'vitest';
import { trackHawlContinuity } from '../src/hawl';

describe('Hawl Lifecycle & Continuity Engine', () => {
  it('detects a completed (matured) Hawl under Jumhur rule', () => {
    // 85g * 1,000,000 = 85,000,000 IDR nisab
    const result = trackHawlContinuity({
      goldPricePerGram: 1000000,
      currency: 'IDR',
      madhhab: 'jumhur',
      calendar: 'hijri', // 354 days
      currentDate: new Date('2026-01-01'),
      ledger: [
        { date: '2025-01-01', balance: 100000000 }, // Started above nisab (100M >= 85M)
        { date: '2025-06-01', balance: 120000000 }, // Always above nisab
        { date: '2025-12-25', balance: 150000000 }  // Matured (> 354 days)
      ]
    });

    expect(result.status).toBe('matured');
    expect(result.isZakatDueNow).toBe(true);
    expect(result.daysElapsed).toBeGreaterThanOrEqual(354);
    expect(result.percentCompleted).toBe('100.0%');
  });

  it('detects broken hawl when balance dips below nisab mid-year under Jumhur', () => {
    const result = trackHawlContinuity({
      goldPricePerGram: 1000000, // 85M nisab
      currency: 'IDR',
      madhhab: 'jumhur',
      calendar: 'hijri',
      currentDate: new Date('2025-08-01'),
      ledger: [
        { date: '2025-01-01', balance: 100000000 }, // Started
        { date: '2025-04-01', balance: 50000000 },  // DIPPED BELOW NISAB! (50M < 85M)
        { date: '2025-07-01', balance: 90000000 }   // Rose back above nisab
      ]
    });

    expect(result.isZakatDueNow).toBe(false);
    // Under Jumhur, the mid-year dip broke the hawl, so it started again in July 2025
    expect(result.hawlStartDate).toBe('2025-07-01');
  });

  it('preserves hawl continuity during mid-year dip under Hanafi madhhab if not zero', () => {
    const result = trackHawlContinuity({
      goldPricePerGram: 1000000, // 85M nisab
      currency: 'IDR',
      madhhab: 'hanafi',
      calendar: 'hijri',
      currentDate: new Date('2026-01-01'),
      ledger: [
        { date: '2025-01-01', balance: 100000000 }, // Began above nisab
        { date: '2025-05-01', balance: 40000000 },  // Mid-year dip (40M < 85M, but > 0)
        { date: '2025-12-25', balance: 110000000 }  // End of year above nisab (110M >= 85M)
      ]
    });

    // Hanafi: Hawl is NOT broken by mid-year dip!
    expect(result.status).toBe('matured');
    expect(result.isZakatDueNow).toBe(true);
    expect(result.hawlStartDate).toBe('2025-01-01');
  });
});
