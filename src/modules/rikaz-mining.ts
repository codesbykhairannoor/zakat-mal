/**
 * zakat-mal: Rikaz (Buried Treasure) & Ma'din (Mining) Zakat Module
 * Grounded in Sahih Bukhari 1499, Sahih Muslim 1710.
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { RikazMiningInput } from '../types/modules';
import { ZakatResult } from '../types/common';
import { getDalilsForCategory } from '../dalil';
import { InvalidInputError } from '../core/errors';
import { t } from '../i18n';

export interface RikazMiningDetails {
  type: 'rikaz' | 'mining';
  extractedValue: string;
  nisabValue: string;
  isNisabReached: boolean;
  rateApplied: string;
}

export function calculateRikazMiningZakat(input: RikazMiningInput): ZakatResult<RikazMiningDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const value = D(input.extractedValue);
  if (value.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Nilai perolehan rikaz / barang tambang tidak boleh negatif.' : 'Extracted rikaz / mining value cannot be negative.',
      'extractedValue'
    );
  }

  const type = input.type;

  let nisabValue: Decimal;
  let isNisabReached: boolean;
  let rateDecimal: string;
  let ratePercent: string;
  const notes: string[] = [t('rikaz_mining_no_hawl', locale)];

  if (type === 'rikaz') {
    // Rikaz: 20% (Khumus), no nisab required according to Jumhur
    nisabValue = D(0);
    isNisabReached = value.gt(0);
    rateDecimal = ISLAMIC_CONSTANTS.RATE_RIKAZ_DECIMAL; // 0.20
    ratePercent = `${ISLAMIC_CONSTANTS.RATE_RIKAZ_PERCENT}% (Al-Khumus / 1/5)`;
    notes.push(t('rikaz_khumus_rule', locale));
  } else if (type === 'mining') {
    // Mining (Ma'din): 2.5%, Nisab = 85g pure gold
    const goldPrice = D(input.goldPricePerGram ?? 0);
    if (goldPrice.lte(0)) {
      throw new InvalidInputError(
        locale === 'id' ? 'Harga emas per gram diperlukan untuk menentukan nisab hasil tambang.' : 'Gold price per gram required for mining nisab.',
        'goldPricePerGram'
      );
    }
    nisabValue = D(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS).mul(goldPrice);
    isNisabReached = value.gte(nisabValue);
    rateDecimal = ISLAMIC_CONSTANTS.RATE_MINING_DECIMAL; // 0.025
    ratePercent = `${ISLAMIC_CONSTANTS.RATE_MINING_PERCENT}%`;

    if (!isNisabReached) {
      notes.push(t('mining_below_nisab', locale, { amount: value.toFixed(2), nisab: nisabValue.toFixed(2), currency }));
    }
  } else {
    throw new InvalidInputError(
      locale === 'id' ? 'Tipe harus: rikaz atau mining.' : 'Type must be rikaz or mining.',
      'type'
    );
  }

  const isObligatory = isNisabReached;
  const zakatDue = isObligatory ? value.mul(rateDecimal) : D(0);

  return {
    category: 'rikaz_mining',
    isObligatory,
    zakatableAmount: value.toFixed(2),
    nisabThreshold: nisabValue.toFixed(2),
    zakatDue: zakatDue.toFixed(2),
    rateApplied: ratePercent,
    calendar: 'hijri',
    currency,
    locale,
    details: {
      type,
      extractedValue: value.toFixed(2),
      nisabValue: nisabValue.toFixed(2),
      isNisabReached,
      rateApplied: ratePercent
    },
    dalilReferences: getDalilsForCategory('rikaz_mining'),
    notes
  };
}
