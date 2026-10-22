/**
 * zakat-mal: Corporate Zakat Module (AAOIFI Shari'ah Standard No. 35)
 * Grounded in AAOIFI Standard No. 35 on Zakah, Section 4/1/4 and Section 4/2.
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { CorporateZakatInput } from '../types/modules';
import { ZakatResult } from '../types/common';
import { getDalilsForCategory } from '../dalil';
import { InvalidInputError } from '../core/errors';
import { t } from '../i18n';

export interface CorporateZakatDetails {
  method: 'net_working_capital' | 'net_equity';
  totalCorporateZakatBase: string;
  muslimOwnershipPercentage: string;
  muslimZakatableBase: string;
  goldPricePerGram: string;
  nisabThreshold: string;
  isNisabReached: boolean;
  calendarApplied: 'hijri' | 'gregorian';
  breakdown: Record<string, string>;
}

export function calculateCorporateZakat(input: CorporateZakatInput): ZakatResult<CorporateZakatDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const method = input.method ?? 'net_working_capital';
  const calendar = input.calendar ?? 'gregorian'; // Corporations standardly report under the Gregorian fiscal year
  const rateDecimal = calendar === 'gregorian' ? ISLAMIC_CONSTANTS.RATE_GREGORIAN_DECIMAL : ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL;
  const ratePercent = calendar === 'gregorian'
    ? `${ISLAMIC_CONSTANTS.RATE_GREGORIAN_PERCENT}% (AAOIFI Standard 35 Solar Adjustment)`
    : `${ISLAMIC_CONSTANTS.RATE_HIJRI_PERCENT}%`;

  const goldPrice = D(input.goldPricePerGram);
  if (goldPrice.lte(0)) {
    throw new InvalidInputError(
      locale === 'id' ? 'Harga emas per gram harus ditentukan dan bernilai positif.' : 'Gold price per gram must be positive.',
      'goldPricePerGram'
    );
  }

  const muslimOwnership = D(input.muslimOwnershipPercentage ?? 100);
  if (muslimOwnership.isNegative() || muslimOwnership.gt(100)) {
    throw new InvalidInputError(
      locale === 'id' ? 'Persentase kepemilikan Muslim harus antara 0 sampai 100%.' : 'Muslim ownership percentage must be between 0 and 100%.',
      'muslimOwnershipPercentage'
    );
  }
  const muslimRatio = muslimOwnership.div(100, 6);

  let totalBase: Decimal;
  const breakdown: Record<string, string> = {};

  if (method === 'net_working_capital') {
    // 1. Net Working Capital Approach (Aset Lancar Bersih)
    const currentAssets = D(input.currentAssets ?? 0);
    const nonZakatable = D(input.nonZakatableCurrentAssets ?? 0);
    const currentLiabilities = D(input.currentLiabilities ?? 0);

    if (currentAssets.isNegative() || nonZakatable.isNegative() || currentLiabilities.isNegative()) {
      throw new InvalidInputError(
        locale === 'id' ? 'Komponen aset dan liabilitas lancar tidak boleh negatif.' : 'Current assets and liabilities cannot be negative.'
      );
    }

    const zakatableCurrentAssets = Decimal.max(0, currentAssets.sub(nonZakatable));
    totalBase = Decimal.max(0, zakatableCurrentAssets.sub(currentLiabilities));

    breakdown['currentAssets'] = currentAssets.toFixed(2);
    breakdown['nonZakatableCurrentAssets'] = nonZakatable.toFixed(2);
    breakdown['zakatableCurrentAssets'] = zakatableCurrentAssets.toFixed(2);
    breakdown['currentLiabilities'] = currentLiabilities.toFixed(2);
  } else if (method === 'net_equity') {
    // 2. Net Equity Approach (Sumber Pendanaan Bersih)
    const capital = D(input.paidUpCapital ?? 0);
    const reserves = D(input.reserves ?? 0);
    const retained = D(input.retainedEarnings ?? 0);
    const longDebt = D(input.longTermDebt ?? 0);

    const fixedAssets = D(input.netFixedAssets ?? 0);
    const longInvest = D(input.longTermInvestments ?? 0);
    const intangibles = D(input.intangibles ?? 0);

    const totalEquityAndFinancing = capital.add(reserves).add(retained).add(longDebt);
    const nonZakatableDeductions = fixedAssets.add(longInvest).add(intangibles);

    totalBase = Decimal.max(0, totalEquityAndFinancing.sub(nonZakatableDeductions));

    breakdown['paidUpCapital'] = capital.toFixed(2);
    breakdown['reserves'] = reserves.toFixed(2);
    breakdown['retainedEarnings'] = retained.toFixed(2);
    breakdown['longTermDebt'] = longDebt.toFixed(2);
    breakdown['netFixedAssets'] = fixedAssets.toFixed(2);
    breakdown['longTermInvestments'] = longInvest.toFixed(2);
    breakdown['intangibles'] = intangibles.toFixed(2);
  } else {
    throw new InvalidInputError(
      locale === 'id' ? 'Metode corporate zakat harus: net_working_capital atau net_equity.' : 'Corporate zakat method must be net_working_capital or net_equity.',
      'method'
    );
  }

  // Adjust for Muslim equity share
  const muslimZakatableBase = totalBase.mul(muslimRatio);

  const nisabValue = D(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS).mul(goldPrice);
  const isNisabReached = muslimZakatableBase.gte(nisabValue);

  const isObligatory = isNisabReached;
  const zakatDue = isObligatory ? muslimZakatableBase.mul(rateDecimal) : D(0);

  const methodName = method === 'net_working_capital' ? 'Net Working Capital Approach' : 'Net Equity Approach';
  const notes: string[] = [t('corporate_aaoifi_applied', locale, { method: methodName })];
  if (calendar === 'gregorian') {
    notes.push(t('corporate_solar_applied', locale));
  }
  if (muslimOwnership.lt(100)) {
    notes.push(t('corporate_muslim_share', locale, { percentage: muslimOwnership.toFixed(2) }));
  }
  if (!isNisabReached) {
    notes.push(t('corporate_below_nisab', locale, { amount: muslimZakatableBase.toFixed(2), nisab: nisabValue.toFixed(2), currency }));
  }

  return {
    category: 'corporate',
    isObligatory,
    zakatableAmount: muslimZakatableBase.toFixed(2),
    nisabThreshold: nisabValue.toFixed(2),
    zakatDue: zakatDue.toFixed(2),
    rateApplied: ratePercent,
    calendar,
    currency,
    locale,
    details: {
      method,
      totalCorporateZakatBase: totalBase.toFixed(2),
      muslimOwnershipPercentage: muslimOwnership.toFixed(2),
      muslimZakatableBase: muslimZakatableBase.toFixed(2),
      goldPricePerGram: goldPrice.toFixed(2),
      nisabThreshold: nisabValue.toFixed(2),
      isNisabReached,
      calendarApplied: calendar,
      breakdown
    },
    dalilReferences: getDalilsForCategory('corporate'),
    notes
  };
}
