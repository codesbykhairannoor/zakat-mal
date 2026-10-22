import { describe, it, expect } from 'vitest';
import {
  validateGoldSilverForm,
  validateIncomeForm,
  validateCashSavingsForm,
  validateBusinessForm,
  validateCorporateForm,
  GOLD_FORM_DESCRIPTORS
} from '../src/schemas';

describe('Front-End Form Validation Schemas & Parsers', () => {
  it('validates gold and silver input with type sanitization', () => {
    // Valid input
    const valid = validateGoldSilverForm({
      goldGrams: '100',
      goldPurityKarat: '22',
      goldPricePerGram: '1600000',
      currency: 'idr'
    });
    expect(valid.isValid).toBe(true);
    expect(valid.data?.goldGrams).toBe(100);
    expect(valid.data?.goldPurityKarat).toBe(22);
    expect(valid.data?.currency).toBe('IDR');

    // Invalid input: negative grams and invalid karat
    const invalid = validateGoldSilverForm({
      goldGrams: '-5',
      goldPurityKarat: '30'
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors['goldGrams']).toBeDefined();
    expect(invalid.errors['goldPurityKarat']).toBeDefined();
  });

  it('validates professional income form inputs', () => {
    const valid = validateIncomeForm({
      grossIncome: '15000000',
      basicLivingExpenses: '5000000',
      dueDebtInstallment: '2000000',
      period: 'monthly'
    });
    expect(valid.isValid).toBe(true);
    expect(valid.data?.grossIncome).toBe(15000000);

    const invalid = validateIncomeForm({
      grossIncome: ''
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors['grossIncome']).toBeDefined();
  });

  it('validates corporate form inputs with Muslim equity bounds', () => {
    const valid = validateCorporateForm({
      currentAssets: '1000000000',
      currentLiabilities: '300000000',
      goldPricePerGram: '1500000',
      muslimOwnershipPercentage: '75'
    });
    expect(valid.isValid).toBe(true);
    expect(valid.data?.muslimOwnershipPercentage).toBe(75);

    const invalid = validateCorporateForm({
      currentAssets: '1000000',
      goldPricePerGram: '1500000',
      muslimOwnershipPercentage: '150' // Exceeds 100%!
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors['muslimOwnershipPercentage']).toBeDefined();
  });

  it('provides rich UI field descriptors for dynamic frontend renderers', () => {
    expect(GOLD_FORM_DESCRIPTORS.length).toBeGreaterThanOrEqual(4);
    const karatField = GOLD_FORM_DESCRIPTORS.find(f => f.name === 'goldPurityKarat');
    expect(karatField?.type).toBe('select');
    expect(karatField?.options?.length).toBe(4);
  });
});
