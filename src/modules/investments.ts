/**
 * zakat-mal: Modern Investments (Stocks, Mutual Funds, Sukuk) & Crypto Zakat Module
 * Grounded in QS. Al-Baqarah 2:267, AAOIFI Shari'ah Standard No. 35, Majma' al-Fiqh al-Islami.
 */

import { D } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { CryptoZakatInput, InvestmentsZakatInput } from '../types/modules';
import { ZakatResult } from '../types/common';
import { getDalilsForCategory } from '../dalil';
import { InvalidInputError } from '../core/errors';
import { t } from '../i18n';

export interface InvestmentsZakatDetails {
  tradingStocksValue: string;
  tradingStocksZakatDue: string;

  longTermDividendIncome: string;
  dividendZakatDue: string;

  mutualFundsValue: string;
  mutualFundsZakatDue: string;

  sukukValue: string;
  sukukZakatDue: string;

  totalPortfolioZakatableBase: string;
  goldPricePerGram: string;
  nisabThreshold: string;
  isNisabReached: boolean;
}

export function calculateInvestmentsZakat(input: InvestmentsZakatInput): ZakatResult<InvestmentsZakatDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const calendar = input.calendar ?? 'hijri';
  const rateDecimal = calendar === 'gregorian' ? ISLAMIC_CONSTANTS.RATE_GREGORIAN_DECIMAL : ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL;
  const ratePercent = calendar === 'gregorian' ? `${ISLAMIC_CONSTANTS.RATE_GREGORIAN_PERCENT}%` : `${ISLAMIC_CONSTANTS.RATE_HIJRI_PERCENT}%`;

  const trading = D(input.tradingStocksValue ?? 0);
  const dividend = D(input.longTermDividendIncome ?? 0);
  const mutualFunds = D(input.mutualFundsValue ?? 0);
  const sukuk = D(input.sukukValue ?? 0);

  if (trading.isNegative() || dividend.isNegative() || mutualFunds.isNegative() || sukuk.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Nilai instrumen investasi tidak boleh bernilai negatif.' : 'Investment instrument values cannot be negative.'
    );
  }

  const goldPrice = D(input.goldPricePerGram);
  if (goldPrice.lte(0)) {
    throw new InvalidInputError(
      locale === 'id' ? 'Harga emas per gram harus ditentukan dan bernilai positif.' : 'Gold price per gram must be positive.',
      'goldPricePerGram'
    );
  }

  const nisabValue = D(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS).mul(goldPrice);

  // Capital value base for capital-growth instruments (trading + mutual funds + sukuk)
  const capitalBase = trading.add(mutualFunds).add(sukuk);
  const isCapitalNisabReached = capitalBase.gte(nisabValue);

  let tradingZakat = D(0);
  let mutualFundsZakat = D(0);
  let sukukZakat = D(0);

  if (isCapitalNisabReached) {
    tradingZakat = trading.mul(rateDecimal);
    mutualFundsZakat = mutualFunds.mul(rateDecimal);
    sukukZakat = sukuk.mul(rateDecimal);
  }

  // Long-term dividend stocks: Majma' Al-Fiqh / Qaradawi analogize to agriculture yield:
  // 10% on net received dividends without zakating the locked fixed capital
  let dividendZakat = D(0);
  if (dividend.gt(0)) {
    dividendZakat = dividend.mul('0.10');
  }

  const totalZakatDue = tradingZakat.add(mutualFundsZakat).add(sukukZakat).add(dividendZakat);
  const totalBase = capitalBase.add(dividend);
  const isObligatory = totalZakatDue.gt(0);

  const notes: string[] = [];
  if (!isCapitalNisabReached && capitalBase.gt(0)) {
    notes.push(t('investments_below_nisab', locale, { amount: capitalBase.toFixed(2), nisab: nisabValue.toFixed(2), currency }));
  }
  if (dividend.gt(0)) {
    notes.push(t('investments_dividend_rule', locale));
  }

  return {
    category: 'investments',
    isObligatory,
    zakatableAmount: totalBase.toFixed(2),
    nisabThreshold: nisabValue.toFixed(2),
    zakatDue: totalZakatDue.toFixed(2),
    rateApplied: locale === 'id' ? `Modal: ${ratePercent} | Dividen: 10%` : `Capital: ${ratePercent} | Dividend: 10%`,
    calendar,
    currency,
    locale,
    details: {
      tradingStocksValue: trading.toFixed(2),
      tradingStocksZakatDue: tradingZakat.toFixed(2),
      longTermDividendIncome: dividend.toFixed(2),
      dividendZakatDue: dividendZakat.toFixed(2),
      mutualFundsValue: mutualFunds.toFixed(2),
      mutualFundsZakatDue: mutualFundsZakat.toFixed(2),
      sukukValue: sukuk.toFixed(2),
      sukukZakatDue: sukukZakat.toFixed(2),
      totalPortfolioZakatableBase: totalBase.toFixed(2),
      goldPricePerGram: goldPrice.toFixed(2),
      nisabThreshold: nisabValue.toFixed(2),
      isNisabReached: isCapitalNisabReached || dividend.gt(0)
    },
    dalilReferences: getDalilsForCategory('investments'),
    notes
  };
}

export interface CryptoZakatDetails {
  portfolioValue: string;
  goldPricePerGram: string;
  nisabThreshold: string;
  isNisabReached: boolean;
  isHawlFulfilled: boolean;
}

export function calculateCryptoZakat(input: CryptoZakatInput): ZakatResult<CryptoZakatDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const calendar = input.calendar ?? 'hijri';
  const rateDecimal = calendar === 'gregorian' ? ISLAMIC_CONSTANTS.RATE_GREGORIAN_DECIMAL : ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL;
  const ratePercent = calendar === 'gregorian' ? `${ISLAMIC_CONSTANTS.RATE_GREGORIAN_PERCENT}%` : `${ISLAMIC_CONSTANTS.RATE_HIJRI_PERCENT}%`;

  const isHawlFulfilled = input.isHawlFulfilled ?? true;

  const portfolio = D(input.portfolioValue);
  if (portfolio.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Nilai portofolio kripto tidak boleh bernilai negatif.' : 'Crypto portfolio value cannot be negative.',
      'portfolioValue'
    );
  }

  const goldPrice = D(input.goldPricePerGram);
  if (goldPrice.lte(0)) {
    throw new InvalidInputError(
      locale === 'id' ? 'Harga emas per gram harus ditentukan dan bernilai positif.' : 'Gold price per gram must be positive.',
      'goldPricePerGram'
    );
  }

  const nisabValue = D(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS).mul(goldPrice);
  const isNisabReached = portfolio.gte(nisabValue);

  const isObligatory = isNisabReached && isHawlFulfilled;
  const zakatDue = isObligatory ? portfolio.mul(rateDecimal) : D(0);

  const notes: string[] = [t('crypto_commodity_treated', locale)];
  if (!isHawlFulfilled) {
    notes.push(t('hawl_not_fulfilled', locale));
  }
  if (!isNisabReached) {
    notes.push(t('crypto_below_nisab', locale, { amount: portfolio.toFixed(2), nisab: nisabValue.toFixed(2), currency }));
  }

  return {
    category: 'crypto',
    isObligatory,
    zakatableAmount: portfolio.toFixed(2),
    nisabThreshold: nisabValue.toFixed(2),
    zakatDue: zakatDue.toFixed(2),
    rateApplied: ratePercent,
    calendar,
    currency,
    locale,
    details: {
      portfolioValue: portfolio.toFixed(2),
      goldPricePerGram: goldPrice.toFixed(2),
      nisabThreshold: nisabValue.toFixed(2),
      isNisabReached,
      isHawlFulfilled
    },
    dalilReferences: getDalilsForCategory('crypto'),
    notes
  };
}
