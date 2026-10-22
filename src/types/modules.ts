/**
 * zakat-mal: Module Input and Output Interfaces
 */

import { CalendarType, Locale } from './common';

// --- Gold & Silver ---
export type JewelryUsage = 'personal' | 'investment' | 'excess';

export interface GoldSilverInput {
  goldGrams?: number | string;
  goldPurityKarat?: number; // 24 (default), 22, 18, 14 etc.
  goldUsage?: JewelryUsage;
  customaryExemptGrams?: number | string; // e.g. up to 100g personal customary limit
  silverGrams?: number | string;
  silverPurityPercent?: number; // 100 (default) or 92.5 (sterling)
  silverUsage?: JewelryUsage;
  goldPricePerGram?: number | string;
  silverPricePerGram?: number | string;
  isHawlFulfilled?: boolean;
  calendar?: CalendarType;
  currency?: string;
  locale?: Locale;
}

// --- Cash & Savings ---
export interface CashSavingsInput {
  cashInHand?: number | string;
  bankSavings?: number | string;
  timeDeposits?: number | string;
  checkingAccounts?: number | string;
  eWallets?: number | string;
  foreignCurrenciesInBase?: number | string;
  immediateDueDebts?: number | string;
  goldPricePerGram: number | string;
  silverPricePerGram?: number | string;
  useSilverNisab?: boolean;
  isHawlFulfilled?: boolean;
  calendar?: CalendarType;
  currency?: string;
  locale?: Locale;
}

// --- Business / 'Urud at-Tijarah ---
export interface BusinessZakatInput {
  cashAndLiquidAssets?: number | string;
  inventoryMarketValue: number | string;
  goodReceivables?: number | string;
  dueOperationalDebts?: number | string;
  goldPricePerGram: number | string;
  isHawlFulfilled?: boolean;
  calendar?: CalendarType;
  currency?: string;
  locale?: Locale;
}

// --- Income / Professional Earnings ---
export type IncomeMethod = 'gross' | 'net';
export type IncomePeriod = 'monthly' | 'annual';

export interface IncomeZakatInput {
  grossIncome: number | string;
  basicLivingExpenses?: number | string;
  dueDebtInstallment?: number | string;
  method?: IncomeMethod;
  period?: IncomePeriod;
  goldPricePerGram?: number | string;
  useBaznasNisab?: boolean; // Uses SK Ketua BAZNAS No. 15 Tahun 2026 (Rp 91.681.728/yr, Rp 7.640.144/mo)
  customNisab?: number | string;
  calendar?: CalendarType;
  currency?: string;
  locale?: Locale;
}

// --- Agriculture ---
export type IrrigationMethod = 'natural' | 'artificial' | 'mixed';
export type ProduceType = 'grain_unhusked' | 'rice_clean' | 'other';

export interface AgricultureZakatInput {
  harvestWeightKg: number | string;
  irrigation: IrrigationMethod;
  produceType?: ProduceType;
  pricePerKg?: number | string;
  operationalCostsDeduction?: number | string;
  customNisabKg?: number | string;
  currency?: string;
  locale?: Locale;
}

// --- Livestock ---
export type LivestockType = 'camel' | 'cattle' | 'sheep';

export interface LivestockInput {
  animalType: LivestockType;
  count: number;
  isPastured?: boolean; // Sa'imah
  isWorkingAnimal?: boolean; // Ghayr 'Amilah
  pricePerUnit?: Record<string, number | string>; // Optional monetary conversion
  currency?: string;
  locale?: Locale;
}

export interface LivestockDueItem {
  animalType: string;
  arabicTerm: string;
  ageDescription: string;
  quantity: number;
}

// --- Rikaz & Mining ---
export type RikazMiningType = 'rikaz' | 'mining';

export interface RikazMiningInput {
  type: RikazMiningType;
  extractedValue: number | string;
  goldPricePerGram?: number | string; // Required for mining nisab
  currency?: string;
  locale?: Locale;
}

// --- Modern Investments & Crypto ---
export type StockStrategy = 'trading' | 'dividend_long_term';

export interface InvestmentsZakatInput {
  tradingStocksValue?: number | string;
  longTermDividendIncome?: number | string;
  mutualFundsValue?: number | string;
  sukukValue?: number | string;
  goldPricePerGram: number | string;
  calendar?: CalendarType;
  currency?: string;
  locale?: Locale;
}

export interface CryptoZakatInput {
  portfolioValue: number | string;
  goldPricePerGram: number | string;
  isHawlFulfilled?: boolean;
  calendar?: CalendarType;
  currency?: string;
  locale?: Locale;
}

// --- Corporate Zakat (AAOIFI Standard 35) ---
export type CorporateZakatMethod = 'net_working_capital' | 'net_equity';

export interface CorporateZakatInput {
  method?: CorporateZakatMethod;
  // Working capital approach fields
  currentAssets?: number | string;
  nonZakatableCurrentAssets?: number | string;
  currentLiabilities?: number | string;
  // Net equity approach fields
  paidUpCapital?: number | string;
  reserves?: number | string;
  retainedEarnings?: number | string;
  longTermDebt?: number | string;
  netFixedAssets?: number | string;
  longTermInvestments?: number | string;
  intangibles?: number | string;
  // Common ownership modifiers
  muslimOwnershipPercentage?: number | string; // 0 to 100 (defaults to 100)
  goldPricePerGram: number | string;
  calendar?: CalendarType;
  currency?: string;
  locale?: Locale;
}

// --- Rental Real Estate / Productive Assets ---
export type RentalZakatMethod = 'receipt_10_percent' | 'annual_surplus_2_5_percent';

export interface RentalYieldInput {
  grossRentalRevenue: number | string;
  maintenanceAndTaxes?: number | string;
  dueDebtOrMortgageInterestExcluded?: number | string;
  method?: RentalZakatMethod;
  goldPricePerGram: number | string;
  calendar?: CalendarType;
  currency?: string;
  locale?: Locale;
}
