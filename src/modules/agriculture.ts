/**
 * zakat-mal: Agriculture & Crops Zakat Module (Zuru' wa Thimar)
 * Grounded in QS. Al-An'am 6:141, Sahih Bukhari 1483, Sahih Bukhari 1405.
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { AgricultureZakatInput } from '../types/modules';
import { ZakatResult } from '../types/common';
import { getDalilsForCategory } from '../dalil';
import { InvalidInputError } from '../core/errors';
import { t } from '../i18n';

export interface AgricultureZakatDetails {
  harvestWeightKg: string;
  produceType: 'grain_unhusked' | 'rice_clean' | 'other';
  irrigation: 'natural' | 'artificial' | 'mixed';
  operationalCostsDeduction: string;
  netHarvestKg: string;
  nisabWeightKg: string;
  isNisabReached: boolean;
  zakatDueKg: string;
  pricePerKg?: string;
  zakatDueMonetary?: string;
}

export function calculateAgricultureZakat(input: AgricultureZakatInput): ZakatResult<AgricultureZakatDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const harvestRaw = D(input.harvestWeightKg);
  if (harvestRaw.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Berat panen tidak boleh bernilai negatif.' : 'Harvest weight cannot be negative.',
      'harvestWeightKg'
    );
  }

  const produceType = input.produceType ?? 'grain_unhusked';
  const irrigation = input.irrigation;

  // Determine rate by irrigation
  let rateDecimal: string;
  let ratePercent: string;
  if (irrigation === 'natural') {
    rateDecimal = ISLAMIC_CONSTANTS.RATE_AGRICULTURE_NATURAL_DECIMAL;
    ratePercent = `${ISLAMIC_CONSTANTS.RATE_AGRICULTURE_NATURAL_PERCENT}% (Al-'Usyr / 1/10)`;
  } else if (irrigation === 'artificial') {
    rateDecimal = ISLAMIC_CONSTANTS.RATE_AGRICULTURE_ARTIFICIAL_DECIMAL;
    ratePercent = `${ISLAMIC_CONSTANTS.RATE_AGRICULTURE_ARTIFICIAL_PERCENT}% (Nisf al-'Usyr / 1/20)`;
  } else if (irrigation === 'mixed') {
    rateDecimal = ISLAMIC_CONSTANTS.RATE_AGRICULTURE_MIXED_DECIMAL;
    ratePercent = `${ISLAMIC_CONSTANTS.RATE_AGRICULTURE_MIXED_PERCENT}% (3/40)`;
  } else {
    throw new InvalidInputError(
      locale === 'id' ? 'Metode irigasi harus: natural, artificial, atau mixed.' : 'Irrigation method must be natural, artificial, or mixed.',
      'irrigation'
    );
  }

  // Determine Nisab
  let nisabWeight: Decimal;
  if (input.customNisabKg) {
    nisabWeight = D(input.customNisabKg);
  } else if (produceType === 'rice_clean') {
    nisabWeight = D(ISLAMIC_CONSTANTS.NISAB_RICE_MILLED_KG); // 520 kg beras
  } else {
    nisabWeight = D(ISLAMIC_CONSTANTS.NISAB_GRAIN_UNHUSKED_KG); // 653 kg gabah
  }

  // Cost deduction (Hanbali and contemporary consensus permits deducting operational costs)
  const costDeduction = D(input.operationalCostsDeduction ?? 0);
  const netHarvest = Decimal.max(0, harvestRaw.sub(costDeduction));

  const isNisabReached = netHarvest.gte(nisabWeight);
  const zakatDueKg = isNisabReached ? netHarvest.mul(rateDecimal) : D(0);

  let zakatDueMonetary: Decimal | undefined;
  let pricePerKgStr: string | undefined;
  if (input.pricePerKg !== undefined) {
    const price = D(input.pricePerKg);
    pricePerKgStr = price.toFixed(2);
    zakatDueMonetary = zakatDueKg.mul(price);
  }

  const notes: string[] = [t('agriculture_no_hawl', locale)];
  if (!isNisabReached) {
    notes.push(t('agriculture_below_nisab', locale, { weight: netHarvest.toFixed(2), nisab: nisabWeight.toFixed(0) }));
  }
  if (costDeduction.gt(0)) {
    notes.push(t('agriculture_costs_deducted', locale, { amount: costDeduction.toFixed(2) }));
  }

  return {
    category: 'agriculture',
    isObligatory: isNisabReached,
    zakatableAmount: `${netHarvest.toFixed(2)} kg`,
    nisabThreshold: `${nisabWeight.toFixed(0)} kg`,
    zakatDue: zakatDueMonetary ? zakatDueMonetary.toFixed(2) : `${zakatDueKg.toFixed(2)} kg`,
    rateApplied: ratePercent,
    calendar: 'hijri',
    currency,
    locale,
    details: {
      harvestWeightKg: harvestRaw.toFixed(2),
      produceType,
      irrigation,
      operationalCostsDeduction: costDeduction.toFixed(2),
      netHarvestKg: netHarvest.toFixed(2),
      nisabWeightKg: nisabWeight.toFixed(0),
      isNisabReached,
      zakatDueKg: zakatDueKg.toFixed(2),
      pricePerKg: pricePerKgStr,
      zakatDueMonetary: zakatDueMonetary?.toFixed(2)
    },
    dalilReferences: getDalilsForCategory('agriculture'),
    notes
  };
}
