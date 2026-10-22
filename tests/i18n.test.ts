import { describe, it, expect } from 'vitest';
import {
  t,
  calculateGoldSilverZakat,
  calculateCashSavingsZakat,
  calculateIncomeZakat,
  calculatePortfolioZakat
} from '../src';

describe('Internationalization (i18n) & Global Multi-Currency Engine', () => {
  it('translates status keys accurately across en, id, and ar', () => {
    expect(t('obligatory', 'en')).toBe('ZAKAT OBLIGATORY (Nisab & Hawl Reached)');
    expect(t('obligatory', 'id')).toBe('WAJIB ZAKAT (Mencapai Nisab & Haul)');
    expect(t('obligatory', 'ar')).toBe('واجبة الزكاة (بلغت النصاب وحال عليها الحول)');

    expect(t('not_obligatory', 'en')).toBe('NOT OBLIGATORY (Below Nisab or Hawl Incomplete)');
    expect(t('not_obligatory', 'id')).toBe('BELUM WAJIB ZAKAT (Di Bawah Nisab atau Haul Belum Genap)');
  });

  it('interpolates parameters correctly in translation helper', () => {
    const textEn = t('gold_nisab_not_reached', 'en', { weight: '50.00', nisab: '85' });
    expect(textEn).toContain('50.00g');
    expect(textEn).toContain('85g');

    const textId = t('gold_nisab_not_reached', 'id', { weight: '50.00', nisab: '85' });
    expect(textId).toContain('50.00g murni');
    expect(textId).toContain('85g');
  });

  it('defaults to English and USD when calculating globally', () => {
    // 100g pure gold @ $75/gram = $7,500 total value. Nisab = 85g ($6,375).
    // Zakat = 100 * 0.025 * $75 = $187.50
    const res = calculateGoldSilverZakat({
      goldGrams: 100,
      goldPricePerGram: 75,
      calendar: 'hijri'
    });

    expect(res.locale).toBe('en');
    expect(res.currency).toBe('USD');
    expect(res.isObligatory).toBe(true);
    expect(res.details.goldZakatDueMonetary).toBe('187.50');
    expect(res.zakatableAmount).toContain('Gold:');
    expect(res.nisabThreshold).toContain('Gold: 85g');
  });

  it('supports Indonesian locale and IDR currency seamlessly', () => {
    const res = calculateGoldSilverZakat({
      goldGrams: 100,
      goldPricePerGram: 1500000,
      locale: 'id'
    });

    expect(res.locale).toBe('id');
    expect(res.currency).toBe('IDR');
    expect(res.details.goldZakatDueMonetary).toBe('3750000.00');
    expect(res.zakatableAmount).toContain('Emas:');
  });

  it('supports Arabic locale and SAR (Saudi Riyal) currency', () => {
    const res = calculateCashSavingsZakat({
      bankSavings: 50000,
      goldPricePerGram: 280, // ~280 SAR/gram -> Nisab 85 * 280 = 23,800 SAR
      currency: 'SAR',
      locale: 'ar'
    });

    expect(res.locale).toBe('ar');
    expect(res.currency).toBe('SAR');
    expect(res.isObligatory).toBe(true);
    // 50,000 * 0.025 = 1,250 SAR
    expect(res.zakatDue).toBe('1250.00');
  });

  it('cascades locale and currency down in calculatePortfolioZakat', () => {
    const portfolio = calculatePortfolioZakat({
      locale: 'en',
      currency: 'USD',
      goldSilver: { goldGrams: 100, goldPricePerGram: 75 },
      cashSavings: { bankSavings: 20000, goldPricePerGram: 75 }
    });

    expect(portfolio.locale).toBe('en');
    expect(portfolio.currency).toBe('USD');
    expect(portfolio.obligatoryCount).toBe(2);
    expect(portfolio.summaryNotes[0]).toContain('Successfully calculated');
  });
});
