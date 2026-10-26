/**
 * zakat-mal: Gold & Silver Zakat Module (An-Naqdayn)
 * Grounded in QS. At-Tawbah 9:34-35, Sunan Abu Dawud 1573, Sahih Bukhari 1405.
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { GoldSilverInput } from '../types/modules';
import { ZakatResult } from '../types/common';
import { getDalilsForCategory } from '../dalil';
import { InvalidInputError } from '../core/errors';
import { t } from '../i18n';

export interface GoldSilverDetails {
  pureGoldWeightGrams: string;
  goldPurityRatio: string;
  isGoldNisabReached: boolean;
  goldZakatDueGrams: string;
  goldZakatDueMonetary: string;

  pureSilverWeightGrams: string;
  silverPurityRatio: string;
  isSilverNisabReached: boolean;
  silverZakatDueGrams: string;
  silverZakatDueMonetary: string;

  isHawlFulfilled: boolean;
  totalZakatDueMonetary: string;
}

export function calculateGoldSilverZakat(input: GoldSilverInput): ZakatResult<GoldSilverDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const calendar = input.calendar ?? 'hijri';
  const rateDecimal = calendar === 'gregorian' ? ISLAMIC_CONSTANTS.RATE_GREGORIAN_DECIMAL : ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL;
  const ratePercent = calendar === 'gregorian' ? `${ISLAMIC_CONSTANTS.RATE_GREGORIAN_PERCENT}%` : `${ISLAMIC_CONSTANTS.RATE_HIJRI_PERCENT}%`;

  const isHawlFulfilled = input.isHawlFulfilled ?? true;

  // 1. Process Gold
  const rawGoldGrams = D(input.goldGrams ?? 0);
  if (rawGoldGrams.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Berat emas tidak boleh negatif.' : 'Gold weight cannot be negative.',
      'goldGrams'
    );
  }

  const goldPurityKarat = input.goldPurityKarat ?? 24;
  if (goldPurityKarat <= 0 || goldPurityKarat > 24) {
    throw new InvalidInputError(
      locale === 'id' ? 'Karat emas harus antara 1 sampai 24.' : 'Gold karat purity must be between 1 and 24.',
      'goldPurityKarat'
    );
  }

  const goldPurityRatio = D(goldPurityKarat).div(24, 6);
  let zakatableGoldGrams = rawGoldGrams.mul(goldPurityRatio);

  const madhhab = input.madhhab ?? 'jumhur';

  // Jewelry usage check based on Madhhab
  const goldUsage = input.goldUsage ?? 'investment';
  const customaryExempt = D(input.customaryExemptGrams ?? 100);

  if (madhhab === 'hanafi') {
    // Madhhab Hanafi: all gold jewelry is zakatable regardless of personal use once nisab is met
    zakatableGoldGrams = rawGoldGrams.mul(goldPurityRatio);
  } else {
    // Jumhur (Shafi'i, Maliki, Hanbali): customary personal jewelry is exempt
    if (goldUsage === 'personal') {
      zakatableGoldGrams = D(0);
    } else if (goldUsage === 'excess') {
      zakatableGoldGrams = Decimal.max(0, zakatableGoldGrams.sub(customaryExempt));
    }
  }

  const goldNisabGrams = D(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS);
  const isGoldNisabReached = zakatableGoldGrams.gte(goldNisabGrams);

  let goldZakatDueGrams = D(0);
  if (isGoldNisabReached && isHawlFulfilled) {
    goldZakatDueGrams = zakatableGoldGrams.mul(rateDecimal);
  }

  const goldPrice = D(input.goldPricePerGram ?? 0);
  if (goldPrice.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Harga emas tidak boleh negatif.' : 'Gold price cannot be negative.',
      'goldPricePerGram'
    );
  }
  const goldZakatDueMonetary = goldZakatDueGrams.mul(goldPrice);

  // 2. Process Silver
  const rawSilverGrams = D(input.silverGrams ?? 0);
  if (rawSilverGrams.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Berat perak tidak boleh negatif.' : 'Silver weight cannot be negative.',
      'silverGrams'
    );
  }

  const silverPurityPercent = input.silverPurityPercent ?? 100;
  const silverPurityRatio = D(silverPurityPercent).div(100, 6);
  let zakatableSilverGrams = rawSilverGrams.mul(silverPurityRatio);

  const silverUsage = input.silverUsage ?? 'investment';
  if (madhhab === 'hanafi') {
    // Madhhab Hanafi: all silver jewelry is zakatable
    zakatableSilverGrams = rawSilverGrams.mul(silverPurityRatio);
  } else {
    if (silverUsage === 'personal') {
      zakatableSilverGrams = D(0);
    }
  }

  const silverNisabGrams = D(ISLAMIC_CONSTANTS.NISAB_SILVER_GRAMS);
  const isSilverNisabReached = zakatableSilverGrams.gte(silverNisabGrams);

  let silverZakatDueGrams = D(0);
  if (isSilverNisabReached && isHawlFulfilled) {
    silverZakatDueGrams = zakatableSilverGrams.mul(rateDecimal);
  }

  const silverPrice = D(input.silverPricePerGram ?? 0);
  if (silverPrice.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Harga perak tidak boleh negatif.' : 'Silver price cannot be negative.',
      'silverPricePerGram'
    );
  }
  const silverZakatDueMonetary = silverZakatDueGrams.mul(silverPrice);

  const totalZakatDueMonetary = goldZakatDueMonetary.add(silverZakatDueMonetary);
  const isObligatory = isHawlFulfilled && (isGoldNisabReached || isSilverNisabReached);

  const notes: string[] = [];
  if (!isHawlFulfilled) {
    notes.push(t('hawl_not_fulfilled', locale));
  }
  if (!isGoldNisabReached && rawGoldGrams.gt(0)) {
    notes.push(t('gold_nisab_not_reached', locale, { weight: zakatableGoldGrams.toFixed(2), nisab: goldNisabGrams.toFixed(0) }));
  }
  if (!isSilverNisabReached && rawSilverGrams.gt(0)) {
    notes.push(t('silver_nisab_not_reached', locale, { weight: zakatableSilverGrams.toFixed(2), nisab: silverNisabGrams.toFixed(0) }));
  }
  if (madhhab === 'hanafi' && (goldUsage === 'personal' || silverUsage === 'personal')) {
    notes.push(
      locale === 'id'
        ? 'Mazhab Hanafi: Seluruh perhiasan pribadi tetap dikenakan zakat jika mencapai nisab (tidak ada pengecualian perhiasan).'
        : 'Hanafi Madhhab: All personal jewelry is zakatable once nisab is met (no personal customary exemption).'
    );
  } else if (goldUsage === 'personal') {
    notes.push(t('personal_jewelry_exempt', locale));
  }

  const goldLabel = locale === 'id' ? 'Emas' : locale === 'ar' ? 'ذهب' : 'Gold';
  const silverLabel = locale === 'id' ? 'Perak' : locale === 'ar' ? 'فضة' : 'Silver';
  const gUnit = locale === 'ar' ? 'غ' : 'g';

  return {
    category: 'gold_silver',
    isObligatory,
    zakatableAmount: `${goldLabel}: ${zakatableGoldGrams.toFixed(2)}${gUnit} | ${silverLabel}: ${zakatableSilverGrams.toFixed(2)}${gUnit}`,
    nisabThreshold: `${goldLabel}: ${goldNisabGrams.toFixed(0)}${gUnit} | ${silverLabel}: ${silverNisabGrams.toFixed(0)}${gUnit}`,
    zakatDue: totalZakatDueMonetary.gt(0)
      ? totalZakatDueMonetary.toFixed(2)
      : `${goldLabel}: ${goldZakatDueGrams.toFixed(4)}${gUnit} | ${silverLabel}: ${silverZakatDueGrams.toFixed(4)}${gUnit}`,
    rateApplied: ratePercent,
    calendar,
    currency,
    locale,
    details: {
      pureGoldWeightGrams: zakatableGoldGrams.toFixed(4),
      goldPurityRatio: goldPurityRatio.toFixed(4),
      isGoldNisabReached,
      goldZakatDueGrams: goldZakatDueGrams.toFixed(4),
      goldZakatDueMonetary: goldZakatDueMonetary.toFixed(2),

      pureSilverWeightGrams: zakatableSilverGrams.toFixed(4),
      silverPurityRatio: silverPurityRatio.toFixed(4),
      isSilverNisabReached,
      silverZakatDueGrams: silverZakatDueGrams.toFixed(4),
      silverZakatDueMonetary: silverZakatDueMonetary.toFixed(2),

      isHawlFulfilled,
      totalZakatDueMonetary: totalZakatDueMonetary.toFixed(2)
    },
    dalilReferences: getDalilsForCategory('gold_silver'),
    notes
  };
}
