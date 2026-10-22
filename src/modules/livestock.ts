/**
 * zakat-mal: Livestock Zakat Module (Al-An'am)
 * Grounded in Sahih Bukhari 1454, Sunan Abu Dawud 1572, Sunan At-Tirmidhi 622.
 */

import { D, Decimal } from '../core/decimal';
import { LivestockDueItem, LivestockInput } from '../types/modules';
import { ZakatResult } from '../types/common';
import { getDalilsForCategory } from '../dalil';
import { InvalidInputError } from '../core/errors';
import { t } from '../i18n';
import { Locale } from '../types/common';

export interface LivestockZakatDetails {
  animalType: 'camel' | 'cattle' | 'sheep';
  totalCount: number;
  isPastured: boolean; // Sa'imah
  isWorkingAnimal: boolean; // Ghayr 'Amilah
  itemsDue: LivestockDueItem[];
  monetaryEquivalent?: string;
}

export function calculateLivestockZakat(input: LivestockInput): ZakatResult<LivestockZakatDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const count = Math.floor(Number(input.count));
  if (isNaN(count) || count < 0) {
    throw new InvalidInputError(
      locale === 'id' ? 'Jumlah hewan ternak harus berupa bilangan bulat positif.' : 'Livestock count must be a positive integer.',
      'count'
    );
  }

  const isPastured = input.isPastured ?? true;
  const isWorkingAnimal = input.isWorkingAnimal ?? false;

  const notes: string[] = [];
  const itemsDue: LivestockDueItem[] = [];

  // Syariah conditions check:
  // Must be Sa'imah (freely pastured) and NOT 'Amilah (working animal)
  if (!isPastured) {
    notes.push(t('livestock_non_pastured_exempt', locale));
  }
  if (isWorkingAnimal) {
    notes.push(t('livestock_working_exempt', locale));
  }

  const isEligible = isPastured && !isWorkingAnimal;

  if (isEligible && count > 0) {
    if (input.animalType === 'sheep') {
      calculateSheepZakat(count, itemsDue, notes, locale);
    } else if (input.animalType === 'cattle') {
      calculateCattleZakat(count, itemsDue, notes, locale);
    } else if (input.animalType === 'camel') {
      calculateCamelZakat(count, itemsDue, notes, locale);
    } else {
      throw new InvalidInputError(
        locale === 'id' ? 'Tipe hewan harus: sheep, cattle, atau camel.' : 'Animal type must be sheep, cattle, or camel.',
        'animalType'
      );
    }
  }

  const isObligatory = isEligible && itemsDue.length > 0;

  // Optional monetary valuation
  let totalMonetary: Decimal | undefined;
  if (input.pricePerUnit && isObligatory) {
    let sum = D(0);
    for (const item of itemsDue) {
      const price = D(input.pricePerUnit[item.arabicTerm] ?? input.pricePerUnit[item.animalType] ?? 0);
      sum = sum.add(price.mul(item.quantity));
    }
    if (sum.gt(0)) {
      totalMonetary = sum;
    }
  }

  const itemsSummary = itemsDue.length > 0
    ? itemsDue.map((i) => `${i.quantity}x ${i.arabicTerm} (${i.animalType})`).join(', ')
    : '0';

  const countUnit = locale === 'id' ? 'ekor' : locale === 'ar' ? 'رأس' : 'head';
  const rateLabel = locale === 'id'
    ? 'Tarif Bertingkat Berdasarkan Nash Shahih (Bukhari & Abu Dawud)'
    : locale === 'ar'
    ? 'أنصبة مقدرة بالسنة الصحيحة (البخاري وأبو داود)'
    : 'Tiered Brackets from Sahih Hadith (Bukhari & Abu Dawud)';

  return {
    category: 'livestock',
    isObligatory,
    zakatableAmount: `${count} ${countUnit}`,
    nisabThreshold: getNisabThresholdDescription(input.animalType, locale),
    zakatDue: totalMonetary ? totalMonetary.toFixed(2) : itemsSummary,
    rateApplied: rateLabel,
    calendar: 'hijri',
    currency,
    locale,
    details: {
      animalType: input.animalType,
      totalCount: count,
      isPastured,
      isWorkingAnimal,
      itemsDue,
      monetaryEquivalent: totalMonetary?.toFixed(2)
    },
    dalilReferences: getDalilsForCategory('livestock'),
    notes
  };
}

function getNisabThresholdDescription(type: 'camel' | 'cattle' | 'sheep', locale: Locale = 'en'): string {
  if (locale === 'id') {
    switch (type) {
      case 'sheep': return '40 ekor kambing/domba';
      case 'cattle': return '30 ekor sapi/kerbau';
      case 'camel': return '5 ekor unta';
    }
  } else if (locale === 'ar') {
    switch (type) {
      case 'sheep': return '٤٠ شاة';
      case 'cattle': return '٣٠ بقرة';
      case 'camel': return '٥ من الإبل';
    }
  } else {
    switch (type) {
      case 'sheep': return '40 sheep/goats';
      case 'cattle': return '30 cattle/cows';
      case 'camel': return '5 camels';
    }
  }
}

/**
 * Zakat Kambing / Domba (Ghanam):
 * - 0-39: 0
 * - 40-120: 1 syah
 * - 121-200: 2 syah
 * - 201-300: 3 syah
 * - > 300: 1 syah per 100 ekor (Math.floor(count / 100))
 */
function calculateSheepZakat(count: number, items: LivestockDueItem[], notes: string[], locale: Locale = 'en') {
  if (count < 40) {
    notes.push(t('livestock_below_nisab', locale, { count, nisab: 40 }));
    return;
  }

  let qty = 0;
  if (count >= 40 && count <= 120) {
    qty = 1;
  } else if (count >= 121 && count <= 200) {
    qty = 2;
  } else if (count >= 201 && count <= 300) {
    qty = 3;
  } else {
    // Above 300: every 100 = 1 sheep
    qty = Math.floor(count / 100);
  }

  items.push({
    animalType: locale === 'id' ? 'Kambing / Domba' : locale === 'ar' ? 'شاة' : 'Sheep / Goat',
    arabicTerm: 'شاة (Syāh)',
    ageDescription: locale === 'id' ? 'Domba berumur 1 tahun / kambing berumur 2 tahun' : '1-year sheep / 2-year goat',
    quantity: qty
  });
}

/**
 * Zakat Sapi / Kerbau (Baqar) - Hadits Mu'adz bin Jabal:
 * Setiap 30 ekor = 1 Tabi' (anak sapi 1 tahun)
 * Setiap 40 ekor = 1 Musinnah (sapi betina 2 tahun)
 */
function calculateCattleZakat(count: number, items: LivestockDueItem[], notes: string[], locale: Locale = 'en') {
  if (count < 30) {
    notes.push(t('livestock_below_nisab', locale, { count, nisab: 30 }));
    return;
  }

  let bestTabi = 0;
  let bestMusinnah = 0;
  let minRemainder = Infinity;

  // Search optimal combination 30x + 40y <= count minimizing remainder
  const maxMusinnah = Math.floor(count / 40);
  for (let y = maxMusinnah; y >= 0; y--) {
    const remaining = count - 40 * y;
    const x = Math.floor(remaining / 30);
    const rem = remaining - 30 * x;

    if (rem < minRemainder) {
      minRemainder = rem;
      bestTabi = x;
      bestMusinnah = y;
      if (rem === 0) break; // Exact match found
    }
  }

  if (bestTabi > 0) {
    items.push({
      animalType: locale === 'id' ? 'Anak Sapi (Tabi\'/Tabi\'ah)' : 'Male / Female Yearling Cattle (Tabi\')',
      arabicTerm: 'تَبِيع / تَبِيعَة',
      ageDescription: locale === 'id' ? 'Anak sapi jantan/betina genap 1 tahun masuk tahun ke-2' : '1-year old yearling cattle entered into 2nd year',
      quantity: bestTabi
    });
  }

  if (bestMusinnah > 0) {
    items.push({
      animalType: locale === 'id' ? 'Sapi Betina (Musinnah)' : 'Two-year-old Cow (Musinnah)',
      arabicTerm: 'مُسِنَّة',
      ageDescription: locale === 'id' ? 'Sapi betina genap 2 tahun masuk tahun ke-3' : '2-year old cow entered into 3rd year',
      quantity: bestMusinnah
    });
  }
}

/**
 * Zakat Unta (Ibil) - Sahih Bukhari 1454:
 */
function calculateCamelZakat(count: number, items: LivestockDueItem[], notes: string[], locale: Locale = 'en') {
  if (count < 5) {
    notes.push(t('livestock_below_nisab', locale, { count, nisab: 5 }));
    return;
  }

  if (count >= 5 && count <= 9) {
    items.push({
      animalType: 'Kambing / Domba',
      arabicTerm: 'شَاة (Syāh)',
      ageDescription: '1 ekor kambing/domba untuk 5-9 ekor unta',
      quantity: 1
    });
  } else if (count >= 10 && count <= 14) {
    items.push({
      animalType: 'Kambing / Domba',
      arabicTerm: 'شَاتَان (Syātān)',
      ageDescription: '2 ekor kambing/domba untuk 10-14 ekor unta',
      quantity: 2
    });
  } else if (count >= 15 && count <= 19) {
    items.push({
      animalType: 'Kambing / Domba',
      arabicTerm: 'ثَلَاث شِيَاه (Thalāth Syiyāh)',
      ageDescription: '3 ekor kambing/domba untuk 15-19 ekor unta',
      quantity: 3
    });
  } else if (count >= 20 && count <= 24) {
    items.push({
      animalType: 'Kambing / Domba',
      arabicTerm: 'أَرْبَع شِيَاه (Arba\' Syiyāh)',
      ageDescription: '4 ekor kambing/domba untuk 20-24 ekor unta',
      quantity: 4
    });
  } else if (count >= 25 && count <= 35) {
    items.push({
      animalType: 'Unta Betina 1 Tahun',
      arabicTerm: 'بِنْت مَخَاض (Bint Makhādh)',
      ageDescription: 'Unta betina genap berumur 1 tahun masuk tahun ke-2',
      quantity: 1
    });
  } else if (count >= 36 && count <= 45) {
    items.push({
      animalType: 'Unta Betina 2 Tahun',
      arabicTerm: 'بِنْت لَبُون (Bint Labūn)',
      ageDescription: 'Unta betina genap berumur 2 tahun masuk tahun ke-3',
      quantity: 1
    });
  } else if (count >= 46 && count <= 60) {
    items.push({
      animalType: 'Unta Betina 3 Tahun',
      arabicTerm: 'حِقَّة (Hiqqah)',
      ageDescription: 'Unta betina genap berumur 3 tahun masuk tahun ke-4',
      quantity: 1
    });
  } else if (count >= 61 && count <= 75) {
    items.push({
      animalType: 'Unta Betina 4 Tahun',
      arabicTerm: 'جَذَعَة (Jadz\'ah)',
      ageDescription: 'Unta betina genap berumur 4 tahun masuk tahun ke-5',
      quantity: 1
    });
  } else if (count >= 76 && count <= 90) {
    items.push({
      animalType: 'Unta Betina 2 Tahun',
      arabicTerm: 'بِنْتَا لَبُون (Bintā Labūn)',
      ageDescription: '2 ekor unta betina genap berumur 2 tahun',
      quantity: 2
    });
  } else if (count >= 91 && count <= 120) {
    items.push({
      animalType: 'Unta Betina 3 Tahun',
      arabicTerm: 'حِقَّتَان (Hiqqatān)',
      ageDescription: '2 ekor unta betina genap berumur 3 tahun',
      quantity: 2
    });
  } else {
    // Count >= 121: Every 40 = 1 Bint Labun, Every 50 = 1 Hiqqah
    let bestBintLabun = 0;
    let bestHiqqah = 0;
    let minRemainder = Infinity;

    const maxHiqqah = Math.floor(count / 50);
    for (let h = maxHiqqah; h >= 0; h--) {
      const remaining = count - 50 * h;
      const b = Math.floor(remaining / 40);
      const rem = remaining - 40 * b;

      if (rem < minRemainder) {
        minRemainder = rem;
        bestBintLabun = b;
        bestHiqqah = h;
        if (rem === 0) break;
      }
    }

    if (bestBintLabun > 0) {
      items.push({
        animalType: 'Unta Betina 2 Tahun (Bint Labun)',
        arabicTerm: 'بِنْت لَبُون',
        ageDescription: 'Unta betina genap berumur 2 tahun',
        quantity: bestBintLabun
      });
    }
    if (bestHiqqah > 0) {
      items.push({
        animalType: 'Unta Betina 3 Tahun (Hiqqah)',
        arabicTerm: 'حِقَّة',
        ageDescription: 'Unta betina genap berumur 3 tahun',
        quantity: bestHiqqah
      });
    }
  }
}
