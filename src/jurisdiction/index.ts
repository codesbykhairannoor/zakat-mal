/**
 * zakat-mal: Active Multi-Jurisdiction & Madhhab Engine
 * Real legal logic for Indonesia (BAZNAS), Malaysia (PPZ/Had Kifayah), Singapore (MUIS CPF), Saudi Arabia (ZATCA), and Classical Madhhabs.
 * Grounded in AAOIFI Standard 35, Fatwa MUI, Fatwa MAIWP/PPZ, and MUIS Singapore.
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { Locale } from '../types/common';
import { InvalidInputError } from '../core/errors';

export type ClassicalMadhhab = 'shafii' | 'hanafi' | 'maliki' | 'hanbali' | 'contemporary';

// ==========================================
// 1. MALAYSIA (PPZ MAIWP / LZS) HAD KIFAYAH
// ==========================================
export interface HadKifayahInput {
  grossAnnualIncome: number | string;
  hasWorkingWife?: boolean;
  hasNonWorkingWife?: boolean;
  numWives?: number;
  numSchoolChildren?: number;
  numUniversityChildren?: number;
  numDisabledChildren?: number;
  numDependentParents?: number;
  annualEpfContribution?: number | string; // KWSP
  medicalExpenses?: number | string;
  goldPricePerGramInMyr?: number | string;
  locale?: Locale;
}

export interface HadKifayahResult {
  jurisdiction: 'my';
  grossAnnualIncome: string;
  totalHadKifayahAllowance: string;
  epfDeducted: string;
  netZakatableIncome: string;
  nisabInMyr: string;
  isObligatory: boolean;
  zakatDueAnnual: string;
  zakatDueMonthly: string;
  breakdown: Record<string, string>;
  legalReference: string;
}

export function calculateMalaysiaIncomeZakat(input: HadKifayahInput): HadKifayahResult {
  const gross = D(input.grossAnnualIncome);
  if (gross.isNegative()) {
    throw new InvalidInputError('Gross income cannot be negative.', 'grossAnnualIncome');
  }

  // Standard MAIWP / PPZ Had Kifayah Allowances (Annual MYR Benchmarks)
  const SELF_ALLOWANCE = D(11000);
  const WIFE_WORKING_ALLOWANCE = D(4000);
  const WIFE_NON_WORKING_ALLOWANCE = D(5000);
  const SCHOOL_CHILD_ALLOWANCE = D(2000);
  const UNIVERSITY_CHILD_ALLOWANCE = D(4000);
  const DISABLED_CHILD_ALLOWANCE = D(3000);
  const PARENT_ALLOWANCE = D(2400);

  let kifayahTotal = SELF_ALLOWANCE;
  const breakdown: Record<string, string> = {
    self: SELF_ALLOWANCE.toFixed(2)
  };

  if (input.hasNonWorkingWife) {
    const wivesCount = input.numWives ?? 1;
    const wifeAllw = WIFE_NON_WORKING_ALLOWANCE.mul(wivesCount);
    kifayahTotal = kifayahTotal.add(wifeAllw);
    breakdown['nonWorkingWife'] = wifeAllw.toFixed(2);
  } else if (input.hasWorkingWife) {
    const wivesCount = input.numWives ?? 1;
    const wifeAllw = WIFE_WORKING_ALLOWANCE.mul(wivesCount);
    kifayahTotal = kifayahTotal.add(wifeAllw);
    breakdown['workingWife'] = wifeAllw.toFixed(2);
  }

  if (input.numSchoolChildren && input.numSchoolChildren > 0) {
    const childAllw = SCHOOL_CHILD_ALLOWANCE.mul(input.numSchoolChildren);
    kifayahTotal = kifayahTotal.add(childAllw);
    breakdown['schoolChildren'] = childAllw.toFixed(2);
  }

  if (input.numUniversityChildren && input.numUniversityChildren > 0) {
    const uniAllw = UNIVERSITY_CHILD_ALLOWANCE.mul(input.numUniversityChildren);
    kifayahTotal = kifayahTotal.add(uniAllw);
    breakdown['universityChildren'] = uniAllw.toFixed(2);
  }

  if (input.numDisabledChildren && input.numDisabledChildren > 0) {
    const disAllw = DISABLED_CHILD_ALLOWANCE.mul(input.numDisabledChildren);
    kifayahTotal = kifayahTotal.add(disAllw);
    breakdown['disabledChildren'] = disAllw.toFixed(2);
  }

  if (input.numDependentParents && input.numDependentParents > 0) {
    const parentAllw = PARENT_ALLOWANCE.mul(input.numDependentParents);
    kifayahTotal = kifayahTotal.add(parentAllw);
    breakdown['dependentParents'] = parentAllw.toFixed(2);
  }

  if (input.medicalExpenses) {
    const med = D(input.medicalExpenses);
    kifayahTotal = kifayahTotal.add(med);
    breakdown['medicalExpenses'] = med.toFixed(2);
  }

  const epf = D(input.annualEpfContribution ?? gross.mul(0.11)); // Default 11% KWSP
  breakdown['epfKwsp'] = epf.toFixed(2);

  const totalDeductions = kifayahTotal.add(epf);
  const netZakatable = Decimal.max(0, gross.sub(totalDeductions));

  const goldPrice = D(input.goldPricePerGramInMyr ?? 380); // ~380 MYR/g benchmark
  const nisab = goldPrice.mul(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS);

  const isObligatory = netZakatable.gte(nisab);
  const zakatDueAnnual = isObligatory ? netZakatable.mul(ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL) : D(0);
  const zakatDueMonthly = zakatDueAnnual.div(12, 2);

  return {
    jurisdiction: 'my',
    grossAnnualIncome: gross.toFixed(2),
    totalHadKifayahAllowance: kifayahTotal.toFixed(2),
    epfDeducted: epf.toFixed(2),
    netZakatableIncome: netZakatable.toFixed(2),
    nisabInMyr: nisab.toFixed(2),
    isObligatory,
    zakatDueAnnual: zakatDueAnnual.toFixed(2),
    zakatDueMonthly: zakatDueMonthly.toFixed(2),
    breakdown,
    legalReference: 'Garis Panduan Pengiraan Zakat Pendapatan PPZ-MAIWP & Fatwa Kebangsaan Malaysia (Kaedah Had Kifayah).'
  };
}

// ==========================================
// 2. SINGAPORE (MUIS) CPF RETIREMENT ZAKAT
// ==========================================
export interface SingaporeCpfZakatInput {
  cpfWithdrawnAmount: number | string;
  isAccountActiveOrLocked?: boolean; // If still locked in CPF board before age 55, exempt
  goldPricePerGramInSgd?: number | string;
  locale?: Locale;
}

export interface SingaporeCpfZakatResult {
  jurisdiction: 'sg';
  withdrawnAmount: string;
  isLockedInBoard: boolean;
  nisabInSgd: string;
  isObligatory: boolean;
  zakatDue: string;
  fatwaNote: string;
}

export function calculateSingaporeCpfZakat(input: SingaporeCpfZakatInput): SingaporeCpfZakatResult {
  const amount = D(input.cpfWithdrawnAmount);
  const isLocked = input.isAccountActiveOrLocked ?? false;
  const goldPrice = D(input.goldPricePerGramInSgd ?? 110);
  const nisab = goldPrice.mul(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS);

  // Per MUIS Fatwa Committee: CPF funds while locked in CPF Board lack complete ownership (Al-Milkiyyah an-Naqisah).
  // Zakat is ONLY due upon actual physical withdrawal into the individual's bank account.
  if (isLocked) {
    return {
      jurisdiction: 'sg',
      withdrawnAmount: amount.toFixed(2),
      isLockedInBoard: true,
      nisabInSgd: nisab.toFixed(2),
      isObligatory: false,
      zakatDue: '0.00',
      fatwaNote: 'Fatwa MUIS: Wang CPF yang masih terkunci dalam akaun CPF belum sempurna milik (Al-Milkiyyah an-Naqisah) dan tidak wajib dizakatkan sehingga dikeluarkan secara sah.'
    };
  }

  const isObligatory = amount.gte(nisab);
  const zakatDue = isObligatory ? amount.mul(ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL) : D(0);

  return {
    jurisdiction: 'sg',
    withdrawnAmount: amount.toFixed(2),
    isLockedInBoard: false,
    nisabInSgd: nisab.toFixed(2),
    isObligatory,
    zakatDue: zakatDue.toFixed(2),
    fatwaNote: 'Fatwa MUIS: Wang CPF yang dikeluarkan secara rasmi (pengeluaran umur 55 tahun atau persaraan) wajib dikeluarkan zakat 2.5% serta-merta apabila mencapai nisab 85g emas.'
  };
}

// ==========================================
// 3. SAUDI ARABIA (ZATCA) CORPORATE PRESET
// ==========================================
export interface SaudiZatcaCorporateInput {
  totalEquityBase: number | string;
  saudiGccShareholdingRatio: number; // e.g. 0.70 for 70% Saudi/GCC equity
  usesSolarAccountingYear?: boolean; // Gregorian 365 days
  goldPricePerGramInSar?: number | string;
  locale?: Locale;
}

export interface SaudiZatcaCorporateResult {
  jurisdiction: 'sa';
  totalEquityBase: string;
  saudiGccEquityAmount: string;
  nonGccEquityAmount: string;
  rateApplied: string;
  zakatDueSar: string;
  taxNote: string;
}

export function calculateSaudiZatcaCorporateZakat(input: SaudiZatcaCorporateInput): SaudiZatcaCorporateResult {
  const equity = D(input.totalEquityBase);
  const ratio = Math.max(0, Math.min(1, input.saudiGccShareholdingRatio));
  const saudiGccEquity = equity.mul(ratio);
  const foreignEquity = equity.sub(saudiGccEquity);

  const isSolar = input.usesSolarAccountingYear ?? true;
  const rate = isSolar ? ISLAMIC_CONSTANTS.RATE_GREGORIAN_DECIMAL : ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL;
  const rateLabel = isSolar ? `${ISLAMIC_CONSTANTS.RATE_GREGORIAN_PERCENT}% (ZATCA Gregorian/Solar Fiscal Adjustment)` : `${ISLAMIC_CONSTANTS.RATE_HIJRI_PERCENT}% (Hijri Fiscal Year)`;

  const zakatDue = saudiGccEquity.mul(rate);

  return {
    jurisdiction: 'sa',
    totalEquityBase: equity.toFixed(2),
    saudiGccEquityAmount: saudiGccEquity.toFixed(2),
    nonGccEquityAmount: foreignEquity.toFixed(2),
    rateApplied: rateLabel,
    zakatDueSar: zakatDue.toFixed(2),
    taxNote: 'ZATCA Executive Regulations: Zakat dikenakan secara eksklusif ke atas bahagian ekuiti warganegara Saudi & GCC. Bahagian ekuiti asing (non-GCC) tidak dikenakan Zakat melainkan tertakluk kepada Corporate Income Tax (20%).'
  };
}

// ==========================================
// 4. CLASSICAL MADHHAB JEWELRY RULE EVALUATOR
// ==========================================
export function evaluateJewelryByMadhhab(params: {
  weightGrams: number | string;
  goldPricePerGram: number | string;
  isCustomaryPersonalAdornment: boolean;
  madhhab: ClassicalMadhhab;
}): { isZakatable: boolean; zakatableGrams: string; zakatDue: string; ruleExplanation: string } {
  const grams = D(params.weightGrams);
  const price = D(params.goldPricePerGram);
  const nisabGrams = D(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS);

  if (params.madhhab === 'hanafi') {
    // Madhhab Hanafi: Jewelry is ALWAYS zakatable unconditionally if >= 85g
    const isZakatable = grams.gte(nisabGrams);
    const zakatDue = isZakatable ? grams.mul(price).mul(ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL) : D(0);
    return {
      isZakatable,
      zakatableGrams: grams.toFixed(2),
      zakatDue: zakatDue.toFixed(2),
      ruleExplanation: 'Madzhab Hanafi: Perhiasan emas wanita TETAP WAJIB dizakati secara mutlak bila mencapai nisab 85g tanpa pengecualian pemakaian wajar.'
    };
  }

  // Jumhur (Shafi'i, Maliki, Hanbali)
  if (params.isCustomaryPersonalAdornment) {
    return {
      isZakatable: false,
      zakatableGrams: '0.00',
      zakatDue: '0.00',
      ruleExplanation: "Jumhur Fuqaha (Syafi'i, Maliki, Hanbali): Emas perhiasan yang dipakai sendiri secara wajar ('Urf) BEBAS DARI ZAKAT karena bukan harta produktif (Ghayr Nami)."
    };
  } else {
    const isZakatable = grams.gte(nisabGrams);
    const zakatDue = isZakatable ? grams.mul(price).mul(ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL) : D(0);
    return {
      isZakatable,
      zakatableGrams: grams.toFixed(2),
      zakatDue: zakatDue.toFixed(2),
      ruleExplanation: "Jumhur Fuqaha: Emas simpanan, investasi, atau perhiasan berlebihan di atas kewajaran ('Urf) WAJIB dizakati sebesar 2.5%."
    };
  }
}
