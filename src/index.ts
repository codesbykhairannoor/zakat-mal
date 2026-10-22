/**
 * zakat-mal: Authoritative, Fiqh-Verified Zakat Mal Calculation Engine
 * Grounded in Al-Qur'an, Sahih Hadith, AAOIFI Shari'ah Standard No. 35, and Fatwa MUI/BAZNAS.
 *
 * @license MIT
 */

// Types
export * from './types/common';
export * from './types/modules';

// Core
export { Decimal, D, type RoundingMode } from './core/decimal';
export { ISLAMIC_CONSTANTS } from './core/constants';
export { ZakatError, InvalidInputError, NisabNotConfiguredError } from './core/errors';

// i18n
export { t, TRANSLATIONS, type TranslationKey } from './i18n';

// Dalil & Shariah Source References
export {
  getAllDalils,
  getDalilById,
  getDalilsForCategory,
  searchDalil,
  QURAN_DALIL,
  HADITH_DALIL,
  CONTEMPORARY_DALIL
} from './dalil';

// Specific Zakat Modules
export { calculateGoldSilverZakat, type GoldSilverDetails } from './modules/gold-silver';
export { calculateCashSavingsZakat, type CashSavingsDetails } from './modules/cash-savings';
export { calculateBusinessZakat, type BusinessZakatDetails } from './modules/business';
export { calculateIncomeZakat, type IncomeZakatDetails } from './modules/income';
export { calculateAgricultureZakat, type AgricultureZakatDetails } from './modules/agriculture';
export { calculateLivestockZakat, type LivestockZakatDetails } from './modules/livestock';
export { calculateRikazMiningZakat, type RikazMiningDetails } from './modules/rikaz-mining';
export {
  calculateInvestmentsZakat,
  calculateCryptoZakat,
  type InvestmentsZakatDetails,
  type CryptoZakatDetails
} from './modules/investments';
export { calculateCorporateZakat, type CorporateZakatDetails } from './modules/corporate';
export { calculateRentalYieldZakat, type RentalYieldDetails } from './modules/rental-yield';

// Engine & Unified Orchestrator
export { NisabTracker } from './engine/nisab-tracker';
export {
  calculatePortfolioZakat,
  type MultiAssetPortfolioInput,
  type MultiAssetPortfolioResult
} from './engine/calculator';

// Oracle & FX Module
export {
  type PriceFeedQuote,
  type FxQuote,
  type PriceOracleAdapter,
  type FxOracleAdapter,
  type CurrencyInfo,
  SUPPORTED_CURRENCIES,
  isValidCurrency,
  getCurrencyInfo,
  StaticPriceOracle,
  StaticFxOracle,
  CachedOracle
} from './oracle';

// Multi-Currency Basket Module
export {
  type BasketAssetItem,
  type BasketCalculationInput,
  type ConvertedAssetBreakdown,
  type BasketCalculationResult,
  calculateMultiCurrencyBasketZakat
} from './basket';

// Hawl Lifecycle Module
export {
  type MadhhabHawlRule,
  type LedgerSnapshot,
  type HawlTrackerInput,
  type HawlEvent,
  type HawlTrackerResult,
  trackHawlContinuity
} from './hawl';

// Jurisdiction & Madhhab Engine
export {
  type ClassicalMadhhab,
  type HadKifayahInput,
  type HadKifayahResult,
  calculateMalaysiaIncomeZakat,
  type SingaporeCpfZakatInput,
  type SingaporeCpfZakatResult,
  calculateSingaporeCpfZakat,
  type SaudiZatcaCorporateInput,
  type SaudiZatcaCorporateResult,
  calculateSaudiZatcaCorporateZakat,
  evaluateJewelryByMadhhab
} from './jurisdiction';

// Akad & Niat Generator
export {
  type ZakatPayerType,
  type GenerateAkadInput,
  type ZakatNiatText,
  type ZakatQabulText,
  type ZakatAkadPackage,
  generateZakatAkad
} from './akad';

// Reports, Tax Deduction Slip & Asnaf Distribution
export {
  type TaxDeductionDetails,
  type AsnafScheduleItem,
  type ZakatCertificate,
  generateZakatCertificate
} from './reports';

// Front-End Form Validation Schemas
export {
  type ValidationResult,
  type FieldDescriptor,
  validateGoldSilverForm,
  validateIncomeForm,
  validateCashSavingsForm,
  validateBusinessForm,
  validateCorporateForm,
  GOLD_FORM_DESCRIPTORS
} from './schemas';
