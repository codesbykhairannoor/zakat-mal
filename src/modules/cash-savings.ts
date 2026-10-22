/**
 * zakat-mal: Cash, Savings & Bank Deposits Module
 * Grounded in QS. At-Tawbah 9:34-35, Sunan Abu Dawud 1573.
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { CashSavingsInput } from '../types/modules';
import { ZakatResult } from '../types/common';
import { getDalilsForCategory } from '../dalil';
import { InvalidInputError } from '../core/errors';
import { t } from '../i18n';

export interface CashSavingsDetails {
  totalGrossLiquidAssets: string;
  immediateDueDebtsDeducted: string;
  netZakatableBase: string;
  nisabStandardUsed: 'gold_85g' | 'silver_595g';
  nisabMonetaryValue: string;
  isNisabReached: boolean;
  isHawlFulfilled: boolean;
  breakdown: {
    cashInHand: string;
    bankSavings: string;
    timeDeposits: string;
    checkingAccounts: string;
    eWallets: string;
    foreignCurrencies: string;
  };
}

export function calculateCashSavingsZakat(input: CashSavingsInput): ZakatResult<CashSavingsDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const calendar = input.calendar ?? 'hijri';
  const rateDecimal = calendar === 'gregorian' ? ISLAMIC_CONSTANTS.RATE_GREGORIAN_DECIMAL : ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL;
  const ratePercent = calendar === 'gregorian' ? `${ISLAMIC_CONSTANTS.RATE_GREGORIAN_PERCENT}%` : `${ISLAMIC_CONSTANTS.RATE_HIJRI_PERCENT}%`;

  const isHawlFulfilled = input.isHawlFulfilled ?? true;

  const cash = D(input.cashInHand ?? 0);
  const savings = D(input.bankSavings ?? 0);
  const deposits = D(input.timeDeposits ?? 0);
  const checking = D(input.checkingAccounts ?? 0);
  const eWallets = D(input.eWallets ?? 0);
  const foreign = D(input.foreignCurrenciesInBase ?? 0);
  const debts = D(input.immediateDueDebts ?? 0);

  if (cash.isNegative() || savings.isNegative() || deposits.isNegative() || checking.isNegative() || eWallets.isNegative() || foreign.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Komponen aset kas/simpanan tidak boleh bernilai negatif.' : 'Cash/liquid asset components cannot be negative.'
    );
  }
  if (debts.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Utang jatuh tempo tidak boleh bernilai negatif.' : 'Due debts cannot be negative.',
      'immediateDueDebts'
    );
  }

  const grossLiquid = cash.add(savings).add(deposits).add(checking).add(eWallets).add(foreign);
  const netZakatable = Decimal.max(0, grossLiquid.sub(debts));

  // Nisab determination
  let nisabValue: Decimal;
  let nisabStandard: 'gold_85g' | 'silver_595g' = 'gold_85g';

  if (input.useSilverNisab) {
    nisabStandard = 'silver_595g';
    const silverPrice = D(input.silverPricePerGram ?? 0);
    if (silverPrice.lte(0)) {
      throw new InvalidInputError(
        locale === 'id' ? 'Harga perak per gram harus ditentukan jika memilih nisab perak.' : 'Silver price per gram must be provided when using silver nisab.',
        'silverPricePerGram'
      );
    }
    nisabValue = D(ISLAMIC_CONSTANTS.NISAB_SILVER_GRAMS).mul(silverPrice);
  } else {
    nisabStandard = 'gold_85g';
    const goldPrice = D(input.goldPricePerGram);
    if (goldPrice.lte(0)) {
      throw new InvalidInputError(
        locale === 'id' ? 'Harga emas per gram harus ditentukan dan bernilai positif.' : 'Gold price per gram must be positive.',
        'goldPricePerGram'
      );
    }
    nisabValue = D(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS).mul(goldPrice);
  }

  const isNisabReached = netZakatable.gte(nisabValue);
  const isObligatory = isNisabReached && isHawlFulfilled;

  const zakatDue = isObligatory ? netZakatable.mul(rateDecimal) : D(0);

  const notes: string[] = [];
  if (!isHawlFulfilled) {
    notes.push(t('hawl_not_fulfilled', locale));
  }
  if (!isNisabReached) {
    notes.push(t('savings_below_nisab', locale, { amount: netZakatable.toFixed(2), nisab: nisabValue.toFixed(2), currency }));
  }
  if (debts.gt(0)) {
    notes.push(t('debt_deducted', locale, { amount: debts.toFixed(2), currency }));
  }

  return {
    category: 'cash_savings',
    isObligatory,
    zakatableAmount: netZakatable.toFixed(2),
    nisabThreshold: nisabValue.toFixed(2),
    zakatDue: zakatDue.toFixed(2),
    rateApplied: ratePercent,
    calendar,
    currency,
    locale,
    details: {
      totalGrossLiquidAssets: grossLiquid.toFixed(2),
      immediateDueDebtsDeducted: debts.toFixed(2),
      netZakatableBase: netZakatable.toFixed(2),
      nisabStandardUsed: nisabStandard,
      nisabMonetaryValue: nisabValue.toFixed(2),
      isNisabReached,
      isHawlFulfilled,
      breakdown: {
        cashInHand: cash.toFixed(2),
        bankSavings: savings.toFixed(2),
        timeDeposits: deposits.toFixed(2),
        checkingAccounts: checking.toFixed(2),
        eWallets: eWallets.toFixed(2),
        foreignCurrencies: foreign.toFixed(2)
      }
    },
    dalilReferences: getDalilsForCategory('cash_savings'),
    notes
  };
}
