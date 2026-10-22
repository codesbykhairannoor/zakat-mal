/**
 * zakat-mal: Global Types, Locale & Multi-Jurisdiction Interfaces
 * Grounded in Al-Qur'an, Sahih Hadith, AAOIFI Shari'ah Standard No. 35, and Global Fiqh Bodies.
 */

export type CalendarType = 'hijri' | 'gregorian';

export type RoundingMode = 'round' | 'floor' | 'ceil' | 'none';

export type Locale = 'en' | 'id' | 'ar';

export type Jurisdiction = 'global' | 'id' | 'sa' | 'ae' | 'my' | 'sg' | 'uk' | 'us';

export type ZakatCategory =
  | 'gold_silver'
  | 'cash_savings'
  | 'business'
  | 'income'
  | 'agriculture'
  | 'livestock'
  | 'investments'
  | 'crypto'
  | 'corporate'
  | 'rikaz_mining'
  | 'rental_yield';

export interface DalilReference {
  id: string;
  category: 'quran' | 'hadith' | 'aaoifi' | 'contemporary_fatwa';
  title: string;
  source: string;
  arabicText: string;
  transliteration?: string;
  translationEn: string;
  translationId: string;
  grade?: string;
  relevance: string;
}

export interface ZakatResult<TDetails = Record<string, any>> {
  category: ZakatCategory;
  isObligatory: boolean;
  zakatableAmount: string;
  nisabThreshold: string;
  zakatDue: string;
  rateApplied: string;
  calendar: CalendarType;
  currency: string;
  locale: Locale;
  details: TDetails;
  dalilReferences: DalilReference[];
  notes: string[];
}

export interface NisabConfig {
  goldPricePerGram?: number | string;
  silverPricePerGram?: number | string;
  unhuskedRicePricePerKg?: number | string;
  milledRicePricePerKg?: number | string;
  currency?: string;
  locale?: Locale;
  customGoldNisabGrams?: number;
  customSilverNisabGrams?: number;
  customGrainNisabKg?: number;
  customRiceNisabKg?: number;
}
