import { describe, it, expect } from 'vitest';
import {
  calculateMalaysiaIncomeZakat,
  calculateSingaporeCpfZakat,
  calculateSaudiZatcaCorporateZakat,
  evaluateJewelryByMadhhab
} from '../src/jurisdiction';

describe('Multi-Jurisdiction & Madhhab Engine', () => {
  it('calculates Malaysia Zakat Pendapatan with Had Kifayah allowances', () => {
    const res = calculateMalaysiaIncomeZakat({
      grossAnnualIncome: 120000, // RM 120,000 / year (RM 10k/month)
      hasNonWorkingWife: true,   // +5,000
      numSchoolChildren: 2,      // +4,000
      numUniversityChildren: 1,  // +4,000
      annualEpfContribution: 13200, // KWSP 11%
      goldPricePerGramInMyr: 380 // Nisab = 85 * 380 = RM 32,300
    });

    // Had Kifayah: Self (11,000) + Wife (5,000) + School (4,000) + Uni (4,000) = 24,000
    // Total deductions = 24,000 + 13,200 = 37,200
    // Net = 120,000 - 37,200 = 82,800
    // 82,800 >= 32,300 -> Wajib!
    // Zakat = 82,800 * 2.5% = 2,070 MYR / year (172.50 / month)
    expect(res.isObligatory).toBe(true);
    expect(res.netZakatableIncome).toBe('82800.00');
    expect(res.zakatDueAnnual).toBe('2070.00');
    expect(res.zakatDueMonthly).toBe('172.50');
  });

  it('exempts Singapore CPF funds while locked in CPF Board and taxes upon withdrawal', () => {
    // 1. Locked CPF savings
    const locked = calculateSingaporeCpfZakat({
      cpfWithdrawnAmount: 80000,
      isAccountActiveOrLocked: true,
      goldPricePerGramInSgd: 110
    });
    expect(locked.isObligatory).toBe(false);
    expect(locked.zakatDue).toBe('0.00');

    // 2. Withdrawn at age 55 (exceeds nisab 85 * 110 = 9350 SGD)
    const withdrawn = calculateSingaporeCpfZakat({
      cpfWithdrawnAmount: 50000,
      isAccountActiveOrLocked: false,
      goldPricePerGramInSgd: 110
    });
    expect(withdrawn.isObligatory).toBe(true);
    expect(withdrawn.zakatDue).toBe('1250.00'); // 50,000 * 2.5%
  });

  it('applies Saudi ZATCA corporate zakat exclusively to Saudi/GCC equity', () => {
    const corporate = calculateSaudiZatcaCorporateZakat({
      totalEquityBase: 10000000, // 10M SAR
      saudiGccShareholdingRatio: 0.60, // 60% Saudi, 40% Foreign
      usesSolarAccountingYear: true // AAOIFI Gregorian 2.577%
    });

    // Saudi equity = 6,000,000 SAR
    // Zakat = 6,000,000 * 2.577% = 154,620 SAR
    expect(corporate.saudiGccEquityAmount).toBe('6000000.00');
    expect(corporate.nonGccEquityAmount).toBe('4000000.00');
    expect(corporate.zakatDueSar).toBe('154620.00');
  });

  it('differentiates Hanafi vs Jumhur rulings on personal gold jewelry', () => {
    // 1. Hanafi: 100g jewelry is ALWAYS zakatable even if customary
    const hanafi = evaluateJewelryByMadhhab({
      weightGrams: 100,
      goldPricePerGram: 100,
      isCustomaryPersonalAdornment: true,
      madhhab: 'hanafi'
    });
    expect(hanafi.isZakatable).toBe(true);
    expect(hanafi.zakatDue).toBe('250.00');

    // 2. Jumhur (Shafi'i/Maliki/Hanbali): customary personal jewelry is EXEMPT
    const jumhur = evaluateJewelryByMadhhab({
      weightGrams: 100,
      goldPricePerGram: 100,
      isCustomaryPersonalAdornment: true,
      madhhab: 'shafii'
    });
    expect(jumhur.isZakatable).toBe(false);
    expect(jumhur.zakatDue).toBe('0.00');
  });
});
