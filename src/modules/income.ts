/**
 * zakat-mal: Professional Income / Earnings Zakat Module
 * Grounded in QS. At-Tawbah 9:103, Fatwa MUI No. 3 Tahun 2003, Peraturan BAZNAS No. 1 Tahun 2024.
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { IncomeZakatInput } from '../types/modules';
import { ZakatResult } from '../types/common';
import { getDalilsForCategory } from '../dalil';
import { InvalidInputError } from '../core/errors';
import { t } from '../i18n';

export interface IncomeZakatDetails {
  method: 'gross' | 'net';
  period: 'monthly' | 'annual';
  grossIncome: string;
  basicLivingExpensesDeducted: string;
  dueDebtInstallmentDeducted: string;
  zakatableBase: string;
  goldPricePerGram: string;
  annualNisabValue: string;
  periodNisabThreshold: string;
  isNisabReached: boolean;
}

export function calculateIncomeZakat(input: IncomeZakatInput): ZakatResult<IncomeZakatDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const method = input.method ?? 'net';
  const period = input.period ?? 'monthly';
  const calendar = input.calendar ?? 'gregorian'; // Professional salaries typically paid per solar/gregorian month
  const rateDecimal = calendar === 'gregorian' ? ISLAMIC_CONSTANTS.RATE_GREGORIAN_DECIMAL : ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL;
  const ratePercent = calendar === 'gregorian' ? `${ISLAMIC_CONSTANTS.RATE_GREGORIAN_PERCENT}%` : `${ISLAMIC_CONSTANTS.RATE_HIJRI_PERCENT}%`;

  const gross = D(input.grossIncome);
  if (gross.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Penghasilan bruto tidak boleh negatif.' : 'Gross income cannot be negative.',
      'grossIncome'
    );
  }

  const expenses = D(input.basicLivingExpenses ?? 0);
  const debts = D(input.dueDebtInstallment ?? 0);
  if (expenses.isNegative() || debts.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Biaya kebutuhan pokok dan cicilan utang tidak boleh negatif.' : 'Living expenses and debt installments cannot be negative.'
    );
  }

  // Calculate nisab
  let annualNisab: Decimal;
  let periodNisab: Decimal;
  let goldPriceStr = '0.00';

  if (input.customNisab !== undefined) {
    const custom = D(input.customNisab);
    if (custom.lte(0)) {
      throw new InvalidInputError(
        locale === 'id' ? 'Nilai custom nisab harus bernilai positif.' : 'Custom nisab must be positive.',
        'customNisab'
      );
    }
    if (period === 'monthly') {
      periodNisab = custom;
      annualNisab = custom.mul(12);
    } else {
      annualNisab = custom;
      periodNisab = custom.div(12, 4);
    }
  } else if (input.useBaznasNisab || (!input.goldPricePerGram && currency === 'IDR')) {
    // Official SK Ketua BAZNAS No. 15 Tahun 2026
    annualNisab = D(ISLAMIC_CONSTANTS.NISAB_INCOME_BAZNAS_2026_ANNUAL);
    periodNisab = D(ISLAMIC_CONSTANTS.NISAB_INCOME_BAZNAS_2026_MONTHLY);
  } else {
    const goldPrice = D(input.goldPricePerGram ?? 0);
    if (goldPrice.lte(0)) {
      throw new InvalidInputError(
        locale === 'id'
          ? 'Harga emas per gram harus ditentukan atau gunakan opsi useBaznasNisab: true.'
          : 'Gold price per gram must be provided or specify a regional preset (e.g. useBaznasNisab: true).',
        'goldPricePerGram'
      );
    }
    goldPriceStr = goldPrice.toFixed(2);
    annualNisab = D(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS).mul(goldPrice);
    periodNisab = period === 'monthly' ? annualNisab.div(12, 4) : annualNisab;
  }

  // Calculate base
  let zakatableBase: Decimal;
  if (method === 'gross') {
    zakatableBase = gross;
  } else {
    // Net method (MUI & contemporary consensus)
    zakatableBase = Decimal.max(0, gross.sub(expenses).sub(debts));
  }

  const isNisabReached = zakatableBase.gte(periodNisab);
  const zakatDue = isNisabReached ? zakatableBase.mul(rateDecimal) : D(0);

  const notes: string[] = [];
  if (!isNisabReached) {
    notes.push(
      t('net_income_below_nisab', locale, {
        amount: zakatableBase.toFixed(2),
        currency,
        period,
        nisab: periodNisab.toFixed(2)
      })
    );
  }
  if (method === 'net' && (expenses.gt(0) || debts.gt(0))) {
    notes.push(
      t('essential_expenses_deducted', locale, {
        expenses: `${expenses.toFixed(2)} ${currency}`,
        debts: `${debts.toFixed(2)} ${currency}`
      })
    );
  }

  return {
    category: 'income',
    isObligatory: isNisabReached,
    zakatableAmount: zakatableBase.toFixed(2),
    nisabThreshold: periodNisab.toFixed(2),
    zakatDue: zakatDue.toFixed(2),
    rateApplied: ratePercent,
    calendar,
    currency,
    locale,
    details: {
      method,
      period,
      grossIncome: gross.toFixed(2),
      basicLivingExpensesDeducted: expenses.toFixed(2),
      dueDebtInstallmentDeducted: debts.toFixed(2),
      zakatableBase: zakatableBase.toFixed(2),
      goldPricePerGram: goldPriceStr,
      annualNisabValue: annualNisab.toFixed(2),
      periodNisabThreshold: periodNisab.toFixed(2),
      isNisabReached
    },
    dalilReferences: getDalilsForCategory('income'),
    notes
  };
}
