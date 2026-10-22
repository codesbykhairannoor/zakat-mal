/**
 * zakat-mal: Unified Multi-Asset Portfolio Calculator
 */

import { D } from '../core/decimal';
import {
  AgricultureZakatInput,
  BusinessZakatInput,
  CashSavingsInput,
  CorporateZakatInput,
  CryptoZakatInput,
  GoldSilverInput,
  IncomeZakatInput,
  InvestmentsZakatInput,
  LivestockInput,
  RentalYieldInput,
  RikazMiningInput
} from '../types/modules';
import { Locale, DalilReference, ZakatResult } from '../types/common';
import { calculateGoldSilverZakat } from '../modules/gold-silver';
import { calculateCashSavingsZakat } from '../modules/cash-savings';
import { calculateBusinessZakat } from '../modules/business';
import { calculateIncomeZakat } from '../modules/income';
import { calculateAgricultureZakat } from '../modules/agriculture';
import { calculateLivestockZakat } from '../modules/livestock';
import { calculateRikazMiningZakat } from '../modules/rikaz-mining';
import { calculateCryptoZakat, calculateInvestmentsZakat } from '../modules/investments';
import { calculateCorporateZakat } from '../modules/corporate';
import { calculateRentalYieldZakat } from '../modules/rental-yield';
import { t } from '../i18n';

export interface MultiAssetPortfolioInput {
  goldSilver?: GoldSilverInput;
  cashSavings?: CashSavingsInput;
  business?: BusinessZakatInput;
  income?: IncomeZakatInput;
  agriculture?: AgricultureZakatInput;
  livestock?: LivestockInput;
  rikazMining?: RikazMiningInput;
  investments?: InvestmentsZakatInput;
  crypto?: CryptoZakatInput;
  corporate?: CorporateZakatInput;
  rentalYield?: RentalYieldInput;
  currency?: string;
  locale?: Locale;
}

export interface MultiAssetPortfolioResult {
  totalZakatDueMonetary: string;
  currency: string;
  locale: Locale;
  itemsCalculatedCount: number;
  obligatoryCount: number;
  results: Record<string, ZakatResult<any>>;
  allDalilReferences: DalilReference[];
  summaryNotes: string[];
}

export function calculatePortfolioZakat(portfolio: MultiAssetPortfolioInput): MultiAssetPortfolioResult {
  const locale = portfolio.locale ?? 'en';
  const currency = portfolio.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  let totalMonetaryDue = D(0);
  const results: Record<string, ZakatResult<any>> = {};
  const allDalilsMap = new Map<string, DalilReference>();
  const summaryNotes: string[] = [];
  let obligatoryCount = 0;

  function registerResult(key: string, res: ZakatResult<any>) {
    results[key] = res;
    if (res.isObligatory) {
      obligatoryCount++;
    }
    for (const dalil of res.dalilReferences) {
      allDalilsMap.set(dalil.id, dalil);
    }
    // Try adding to total if monetary amount is parseable
    const numericDue = parseFloat(res.zakatDue.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericDue) && numericDue > 0 && !res.zakatDue.includes('kg') && !res.zakatDue.includes('ekor') && !res.zakatDue.includes('head') && !res.zakatDue.includes('رأس')) {
      totalMonetaryDue = totalMonetaryDue.add(numericDue);
    }
  }

  if (portfolio.goldSilver) {
    registerResult('goldSilver', calculateGoldSilverZakat({ locale, currency, ...portfolio.goldSilver }));
  }
  if (portfolio.cashSavings) {
    registerResult('cashSavings', calculateCashSavingsZakat({ locale, currency, ...portfolio.cashSavings }));
  }
  if (portfolio.business) {
    registerResult('business', calculateBusinessZakat({ locale, currency, ...portfolio.business }));
  }
  if (portfolio.income) {
    registerResult('income', calculateIncomeZakat({ locale, currency, ...portfolio.income }));
  }
  if (portfolio.agriculture) {
    registerResult('agriculture', calculateAgricultureZakat({ locale, currency, ...portfolio.agriculture }));
  }
  if (portfolio.livestock) {
    registerResult('livestock', calculateLivestockZakat({ locale, currency, ...portfolio.livestock }));
  }
  if (portfolio.rikazMining) {
    registerResult('rikazMining', calculateRikazMiningZakat({ locale, currency, ...portfolio.rikazMining }));
  }
  if (portfolio.investments) {
    registerResult('investments', calculateInvestmentsZakat({ locale, currency, ...portfolio.investments }));
  }
  if (portfolio.crypto) {
    registerResult('crypto', calculateCryptoZakat({ locale, currency, ...portfolio.crypto }));
  }
  if (portfolio.corporate) {
    registerResult('corporate', calculateCorporateZakat({ locale, currency, ...portfolio.corporate }));
  }
  if (portfolio.rentalYield) {
    registerResult('rentalYield', calculateRentalYieldZakat({ locale, currency, ...portfolio.rentalYield }));
  }

  const itemsCalculatedCount = Object.keys(results).length;

  summaryNotes.push(
    t('portfolio_summary', locale, {
      total: itemsCalculatedCount,
      obligatory: obligatoryCount
    })
  );

  return {
    totalZakatDueMonetary: totalMonetaryDue.toFixed(2),
    currency,
    locale,
    itemsCalculatedCount,
    obligatoryCount,
    results,
    allDalilReferences: Array.from(allDalilsMap.values()),
    summaryNotes
  };
}
