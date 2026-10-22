/**
 * zakat-mal: Rental Property & Productive Assets Zakat Module (Al-Mustaghallat)
 * Grounded in QS. Al-Baqarah 2:267, QS. Al-An'am 6:141, Majma' al-Fiqh al-Islami.
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { RentalYieldInput } from '../types/modules';
import { ZakatResult } from '../types/common';
import { getDalilsForCategory } from '../dalil';
import { InvalidInputError } from '../core/errors';
import { t } from '../i18n';

export interface RentalYieldDetails {
  grossRentalRevenue: string;
  maintenanceAndTaxesDeducted: string;
  netRentalYield: string;
  method: 'receipt_10_percent' | 'annual_surplus_2_5_percent';
  goldPricePerGram: string;
  nisabThreshold: string;
  isNisabReached: boolean;
}

export function calculateRentalYieldZakat(input: RentalYieldInput): ZakatResult<RentalYieldDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const method = input.method ?? 'receipt_10_percent';
  const calendar = input.calendar ?? 'gregorian';

  const gross = D(input.grossRentalRevenue);
  if (gross.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Pendapatan sewa kotor tidak boleh negatif.' : 'Gross rental revenue cannot be negative.',
      'grossRentalRevenue'
    );
  }

  const deductions = D(input.maintenanceAndTaxes ?? 0).add(D(input.dueDebtOrMortgageInterestExcluded ?? 0));
  if (deductions.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Biaya perawatan dan operasional tidak boleh negatif.' : 'Maintenance and operational deductions cannot be negative.'
    );
  }

  const netYield = Decimal.max(0, gross.sub(deductions));

  const goldPrice = D(input.goldPricePerGram);
  if (goldPrice.lte(0)) {
    throw new InvalidInputError(
      locale === 'id' ? 'Harga emas per gram harus ditentukan dan bernilai positif.' : 'Gold price per gram must be positive.',
      'goldPricePerGram'
    );
  }

  const annualNisab = D(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS).mul(goldPrice);
  const isNisabReached = netYield.gte(annualNisab);

  let rateDecimal: string;
  let ratePercent: string;

  if (method === 'receipt_10_percent') {
    // 10% on net yield upon receipt (Majma' Al-Fiqh / Qaradawi analogizing to agriculture)
    rateDecimal = ISLAMIC_CONSTANTS.RATE_RENTAL_YIELD_RECEIPT_DECIMAL; // 0.10
    ratePercent = locale === 'id' ? '10.0% (Qiyas \'Ala az-Zuru\' atas hasil bersih sewa)' : '10.0% (Qiyas to Agriculture on Net Yield)';
  } else {
    // 2.5% on annual accumulated surplus
    rateDecimal = calendar === 'gregorian' ? ISLAMIC_CONSTANTS.RATE_GREGORIAN_DECIMAL : ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL;
    ratePercent = calendar === 'gregorian' ? `${ISLAMIC_CONSTANTS.RATE_GREGORIAN_PERCENT}%` : `${ISLAMIC_CONSTANTS.RATE_HIJRI_PERCENT}%`;
  }

  const isObligatory = isNisabReached;
  const zakatDue = isObligatory ? netYield.mul(rateDecimal) : D(0);

  const notes: string[] = [t('rental_capital_exempt', locale)];
  if (!isNisabReached) {
    notes.push(t('rental_below_nisab', locale, { amount: netYield.toFixed(2), nisab: annualNisab.toFixed(2), currency }));
  }
  if (deductions.gt(0)) {
    notes.push(t('rental_deductions_applied', locale, { amount: deductions.toFixed(2), currency }));
  }

  return {
    category: 'rental_yield',
    isObligatory,
    zakatableAmount: netYield.toFixed(2),
    nisabThreshold: annualNisab.toFixed(2),
    zakatDue: zakatDue.toFixed(2),
    rateApplied: ratePercent,
    calendar,
    currency,
    locale,
    details: {
      grossRentalRevenue: gross.toFixed(2),
      maintenanceAndTaxesDeducted: deductions.toFixed(2),
      netRentalYield: netYield.toFixed(2),
      method,
      goldPricePerGram: goldPrice.toFixed(2),
      nisabThreshold: annualNisab.toFixed(2),
      isNisabReached
    },
    dalilReferences: getDalilsForCategory('rental_yield'),
    notes
  };
}
