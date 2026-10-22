/**
 * zakat-mal: Business Merchandise Zakat Module ('Urud at-Tijarah)
 * Grounded in QS. Al-Baqarah 2:267, Sunan Abu Dawud 1562.
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { BusinessZakatInput } from '../types/modules';
import { ZakatResult } from '../types/common';
import { getDalilsForCategory } from '../dalil';
import { InvalidInputError } from '../core/errors';
import { t } from '../i18n';

export interface BusinessZakatDetails {
  liquidCash: string;
  inventoryMarketValue: string;
  goodReceivables: string;
  dueOperationalDebts: string;
  netWorkingCapitalBase: string;
  goldPricePerGram: string;
  nisabThreshold: string;
  isNisabReached: boolean;
  isHawlFulfilled: boolean;
}

export function calculateBusinessZakat(input: BusinessZakatInput): ZakatResult<BusinessZakatDetails> {
  const locale = input.locale ?? 'en';
  const currency = input.currency ?? (locale === 'id' ? 'IDR' : 'USD');
  const calendar = input.calendar ?? 'hijri';
  const rateDecimal = calendar === 'gregorian' ? ISLAMIC_CONSTANTS.RATE_GREGORIAN_DECIMAL : ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL;
  const ratePercent = calendar === 'gregorian' ? `${ISLAMIC_CONSTANTS.RATE_GREGORIAN_PERCENT}%` : `${ISLAMIC_CONSTANTS.RATE_HIJRI_PERCENT}%`;

  const isHawlFulfilled = input.isHawlFulfilled ?? true;

  const cash = D(input.cashAndLiquidAssets ?? 0);
  const inventory = D(input.inventoryMarketValue);
  const receivables = D(input.goodReceivables ?? 0);
  const debts = D(input.dueOperationalDebts ?? 0);

  if (cash.isNegative() || inventory.isNegative() || receivables.isNegative() || debts.isNegative()) {
    throw new InvalidInputError(
      locale === 'id' ? 'Nilai kas, persediaan, piutang, dan utang usaha tidak boleh bernilai negatif.' : 'Cash, inventory, receivables, and debts cannot be negative.'
    );
  }

  const goldPrice = D(input.goldPricePerGram);
  if (goldPrice.lte(0)) {
    throw new InvalidInputError(
      locale === 'id' ? 'Harga emas per gram harus ditentukan dan bernilai positif.' : 'Gold price per gram must be positive.',
      'goldPricePerGram'
    );
  }

  const grossAssets = cash.add(inventory).add(receivables);
  const netZakatable = Decimal.max(0, grossAssets.sub(debts));

  const nisabValue = D(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS).mul(goldPrice);
  const isNisabReached = netZakatable.gte(nisabValue);

  const isObligatory = isNisabReached && isHawlFulfilled;
  const zakatDue = isObligatory ? netZakatable.mul(rateDecimal) : D(0);

  const notes: string[] = [];
  if (!isHawlFulfilled) {
    notes.push(t('hawl_not_fulfilled', locale));
  }
  if (!isNisabReached) {
    notes.push(t('business_below_nisab', locale, { amount: netZakatable.toFixed(2), nisab: nisabValue.toFixed(2), currency }));
  }
  if (debts.gt(0)) {
    notes.push(t('debt_deducted', locale, { amount: debts.toFixed(2), currency }));
  }

  return {
    category: 'business',
    isObligatory,
    zakatableAmount: netZakatable.toFixed(2),
    nisabThreshold: nisabValue.toFixed(2),
    zakatDue: zakatDue.toFixed(2),
    rateApplied: ratePercent,
    calendar,
    currency,
    locale,
    details: {
      liquidCash: cash.toFixed(2),
      inventoryMarketValue: inventory.toFixed(2),
      goodReceivables: receivables.toFixed(2),
      dueOperationalDebts: debts.toFixed(2),
      netWorkingCapitalBase: netZakatable.toFixed(2),
      goldPricePerGram: goldPrice.toFixed(2),
      nisabThreshold: nisabValue.toFixed(2),
      isNisabReached,
      isHawlFulfilled
    },
    dalilReferences: getDalilsForCategory('business'),
    notes
  };
}
