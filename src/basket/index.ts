/**
 * zakat-mal: Multi-Currency Asset Basket & FX Auto-Conversion Engine
 * Implements Classical Fiqh of Dhamm al-Amwal (Consolidation of Monetary Assets)
 * Grounded in AAOIFI Standard No. 35, Majma' al-Fiqh al-Islami, and Al-Qur'an At-Tawbah 9:34.
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { CalendarType, Locale, ZakatCategory } from '../types/common';
import { FxOracleAdapter, PriceOracleAdapter, StaticFxOracle, StaticPriceOracle, getCurrencyInfo } from '../oracle';
import { InvalidInputError } from '../core/errors';

export interface BasketAssetItem {
  id?: string;
  name: string;
  category: ZakatCategory;
  amount: number | string;
  currency: string;
  // Optional specific parameters
  goldGrams?: number | string;
  goldPurityKarat?: number;
  silverGrams?: number | string;
  debtsDeductible?: number | string;
  isHawlFulfilled?: boolean;
  metadata?: Record<string, any>;
}

export interface BasketCalculationInput {
  targetCurrency: string;
  assets: BasketAssetItem[];
  goldPriceInTargetCurrency?: number | string;
  silverPriceInTargetCurrency?: number | string;
  fxOracle?: FxOracleAdapter;
  priceOracle?: PriceOracleAdapter;
  calendar?: CalendarType;
  locale?: Locale;
}

export interface ConvertedAssetBreakdown {
  id: string;
  name: string;
  category: ZakatCategory;
  originalAmount: string;
  originalCurrency: string;
  fxRateToTarget: string;
  convertedAmountTargetCurrency: string;
  isHawlFulfilled: boolean;
}

export interface BasketCalculationResult {
  targetCurrency: string;
  totalZakatableBaseTargetCurrency: string;
  goldNisabValueTargetCurrency: string;
  goldPricePerGramTargetCurrency: string;
  isNisabReached: boolean;
  totalZakatDueTargetCurrency: string;
  rateApplied: string;
  calendar: CalendarType;
  locale: Locale;
  convertedItems: ConvertedAssetBreakdown[];
  summaryNotes: string[];
}

export async function calculateMultiCurrencyBasketZakat(
  input: BasketCalculationInput
): Promise<BasketCalculationResult> {
  const targetCurrency = (input.targetCurrency || 'USD').toUpperCase();
  const locale = input.locale ?? 'en';
  const calendar = input.calendar ?? 'hijri';
  const rateDecimal = calendar === 'gregorian' ? ISLAMIC_CONSTANTS.RATE_GREGORIAN_DECIMAL : ISLAMIC_CONSTANTS.RATE_HIJRI_DECIMAL;
  const ratePercent = calendar === 'gregorian' ? `${ISLAMIC_CONSTANTS.RATE_GREGORIAN_PERCENT}%` : `${ISLAMIC_CONSTANTS.RATE_HIJRI_PERCENT}%`;

  const fxOracle = input.fxOracle ?? new StaticFxOracle();
  const priceOracle = input.priceOracle ?? new StaticPriceOracle();

  // 1. Resolve Gold Price in Target Currency for Nisab
  let goldPriceTarget: Decimal;
  if (input.goldPriceInTargetCurrency !== undefined) {
    goldPriceTarget = D(input.goldPriceInTargetCurrency);
  } else {
    try {
      const quote = await priceOracle.fetchPrice('gold', targetCurrency);
      goldPriceTarget = D(quote.pricePerUnit);
    } catch {
      // Fallback cross via USD
      const usdQuote = await priceOracle.fetchPrice('gold', 'USD');
      const fx = await fxOracle.fetchFxRate('USD', targetCurrency);
      goldPriceTarget = D(usdQuote.pricePerUnit).mul(fx.rate);
    }
  }

  if (goldPriceTarget.lte(0)) {
    throw new InvalidInputError('Gold price in target currency must be greater than zero.', 'goldPriceInTargetCurrency');
  }

  const nisabGoldTarget = goldPriceTarget.mul(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS);

  // 2. Process each asset in the basket and convert to Target Currency
  let totalConsolidatedBase = D(0);
  const convertedItems: ConvertedAssetBreakdown[] = [];
  const notes: string[] = [];

  for (let i = 0; i < input.assets.length; i++) {
    const asset = input.assets[i];
    if (!asset) continue;
    const assetCurrency = (asset.currency || targetCurrency).toUpperCase();
    const itemId = asset.id || `asset_${i + 1}_${asset.category}`;
    const rawAmount = D(asset.amount);

    if (rawAmount.isNegative()) {
      throw new InvalidInputError(`Asset '${asset.name}' amount cannot be negative.`, `assets[${i}].amount`);
    }

    // Determine FX Rate
    let fxRate = D(1);
    if (assetCurrency !== targetCurrency) {
      const quote = await fxOracle.fetchFxRate(assetCurrency, targetCurrency);
      fxRate = D(quote.rate);
    }

    // Handle Gold Grams if given directly
    let effectiveOriginalAmount = rawAmount;
    if (asset.category === 'gold_silver' && asset.goldGrams !== undefined) {
      const grams = D(asset.goldGrams);
      const purity = D(asset.goldPurityKarat ?? 24).div(24, 6);
      const pureGrams = grams.mul(purity);
      // Value in asset currency or target currency
      let goldPriceLocal = goldPriceTarget;
      if (assetCurrency !== targetCurrency) {
        try {
          const localQuote = await priceOracle.fetchPrice('gold', assetCurrency);
          goldPriceLocal = D(localQuote.pricePerUnit);
        } catch {
          goldPriceLocal = goldPriceTarget.div(fxRate, 4);
        }
      }
      effectiveOriginalAmount = pureGrams.mul(goldPriceLocal);
    }

    // Deduct immediate short-term operational debts if specified for this asset
    const debt = D(asset.debtsDeductible ?? 0);
    const netOriginal = Decimal.max(0, effectiveOriginalAmount.sub(debt));
    const convertedTargetAmount = netOriginal.mul(fxRate);

    const isHawlFulfilled = asset.isHawlFulfilled ?? true;

    if (isHawlFulfilled) {
      totalConsolidatedBase = totalConsolidatedBase.add(convertedTargetAmount);
    } else {
      notes.push(
        locale === 'id'
          ? `Aset '${asset.name}' dikecualikan dari total zakat karena belum memenuhi syarat haul 1 tahun.`
          : `Asset '${asset.name}' was excluded from current zakat liability because Hawl (1-year hold) is incomplete.`
      );
    }

    convertedItems.push({
      id: itemId,
      name: asset.name,
      category: asset.category,
      originalAmount: effectiveOriginalAmount.toFixed(2),
      originalCurrency: assetCurrency,
      fxRateToTarget: fxRate.toFixed(6),
      convertedAmountTargetCurrency: convertedTargetAmount.toFixed(2),
      isHawlFulfilled
    });
  }

  // 3. Evaluate Consolidated Nisab & Final Zakat Due
  const isNisabReached = totalConsolidatedBase.gte(nisabGoldTarget);
  const totalZakatDue = isNisabReached ? totalConsolidatedBase.mul(rateDecimal) : D(0);

  const targetMeta = getCurrencyInfo(targetCurrency);
  const formattedZakatDue = totalZakatDue.toFixed(targetMeta.decimals);

  notes.push(
    locale === 'id'
      ? `Prinsip Dhamm al-Amwal: Seluruh aset moneter (${convertedItems.length} instrumen) dikonsolidasikan ke dalam ${targetCurrency} dengan nisab ${ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS}g emas (${nisabGoldTarget.toFixed(2)} ${targetCurrency}).`
      : `Dhamm al-Amwal Principle: All ${convertedItems.length} monetary instruments consolidated into ${targetCurrency} against the 85g gold Nisab (${nisabGoldTarget.toFixed(2)} ${targetCurrency}).`
  );

  return {
    targetCurrency,
    totalZakatableBaseTargetCurrency: totalConsolidatedBase.toFixed(2),
    goldNisabValueTargetCurrency: nisabGoldTarget.toFixed(2),
    goldPricePerGramTargetCurrency: goldPriceTarget.toFixed(2),
    isNisabReached,
    totalZakatDueTargetCurrency: formattedZakatDue,
    rateApplied: ratePercent,
    calendar,
    locale,
    convertedItems,
    summaryNotes: notes
  };
}
