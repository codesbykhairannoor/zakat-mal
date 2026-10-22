/**
 * zakat-mal: Dalil Service and Retrieval Engine
 */

import { DalilReference, ZakatCategory } from '../types/common';
import { QURAN_DALIL } from './quran';
import { HADITH_DALIL } from './hadith';
import { CONTEMPORARY_DALIL } from './contemporary';

export { QURAN_DALIL } from './quran';
export { HADITH_DALIL } from './hadith';
export { CONTEMPORARY_DALIL } from './contemporary';

const ALL_DALILS: DalilReference[] = [
  ...Object.values(QURAN_DALIL),
  ...Object.values(HADITH_DALIL),
  ...Object.values(CONTEMPORARY_DALIL)
];

export function getAllDalils(): DalilReference[] {
  return [...ALL_DALILS];
}

export function getDalilById(id: string): DalilReference | undefined {
  return ALL_DALILS.find((item) => item.id.toLowerCase() === id.toLowerCase());
}

export function getDalilsForCategory(category: ZakatCategory): DalilReference[] {
  switch (category) {
    case 'gold_silver':
      return [
        QURAN_DALIL.GOLD_SILVER_WARNING!,
        HADITH_DALIL.GOLD_SILVER_NISAB_RATE!,
        HADITH_DALIL.SILVER_FIVE_UQIAH!,
        HADITH_DALIL.HAWL_CONDITION!
      ].filter(Boolean);

    case 'cash_savings':
      return [
        QURAN_DALIL.PURIFICATION_COMMAND!,
        QURAN_DALIL.GOLD_SILVER_WARNING!,
        HADITH_DALIL.GOLD_SILVER_NISAB_RATE!,
        HADITH_DALIL.HAWL_CONDITION!
      ].filter(Boolean);

    case 'business':
      return [
        QURAN_DALIL.EARNED_WEALTH_BUSINESS!,
        HADITH_DALIL.BUSINESS_TRADE_INVENTORY!,
        HADITH_DALIL.GOLD_SILVER_NISAB_RATE!,
        HADITH_DALIL.HAWL_CONDITION!
      ].filter(Boolean);

    case 'income':
      return [
        QURAN_DALIL.PURIFICATION_COMMAND!,
        QURAN_DALIL.EARNED_WEALTH_BUSINESS!,
        CONTEMPORARY_DALIL.MUI_FATWA_INCOME_ZAKAT!,
        CONTEMPORARY_DALIL.BAZNAS_SK_NISAB_2026!
      ].filter(Boolean);

    case 'agriculture':
      return [
        QURAN_DALIL.AGRICULTURE_HARVEST!,
        HADITH_DALIL.AGRICULTURE_IRRIGATION_RATES!,
        HADITH_DALIL.SILVER_FIVE_UQIAH!
      ].filter(Boolean);

    case 'livestock':
      return [
        HADITH_DALIL.LIVESTOCK_SHEEP_CAMEL_LETTER!,
        HADITH_DALIL.LIVESTOCK_CATTLE_MUADH!,
        HADITH_DALIL.HAWL_CONDITION!
      ].filter(Boolean);

    case 'rikaz_mining':
      return [
        HADITH_DALIL.RIKAZ_KHUMUS_20_PERCENT!,
        QURAN_DALIL.EARNED_WEALTH_BUSINESS!
      ].filter(Boolean);

    case 'investments':
    case 'crypto':
      return [
        QURAN_DALIL.EARNED_WEALTH_BUSINESS!,
        HADITH_DALIL.BUSINESS_TRADE_INVENTORY!,
        HADITH_DALIL.GOLD_SILVER_NISAB_RATE!,
        HADITH_DALIL.HAWL_CONDITION!
      ].filter(Boolean);

    case 'corporate':
      return [
        CONTEMPORARY_DALIL.AAOIFI_STANDARD_35_CORPORATE_METHODS!,
        CONTEMPORARY_DALIL.AAOIFI_STANDARD_35_SOLAR_RATE!,
        QURAN_DALIL.EARNED_WEALTH_BUSINESS!
      ].filter(Boolean);

    case 'rental_yield':
      return [
        QURAN_DALIL.AGRICULTURE_HARVEST!,
        QURAN_DALIL.EARNED_WEALTH_BUSINESS!,
        HADITH_DALIL.HAWL_CONDITION!
      ].filter(Boolean);

    default:
      return [QURAN_DALIL.PURIFICATION_COMMAND!].filter(Boolean);
  }
}

export function searchDalil(keyword: string): DalilReference[] {
  const q = keyword.toLowerCase().trim();
  if (!q) return [];
  return ALL_DALILS.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q) ||
      item.translationId.toLowerCase().includes(q) ||
      item.translationEn.toLowerCase().includes(q) ||
      item.relevance.toLowerCase().includes(q)
  );
}
