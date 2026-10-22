/**
 * zakat-mal: Lightweight Front-End Form Validation Schemas & Parsers
 * Zero-dependency, isomorphic validation helpers designed for React Hook Form, Formik, Vue, and Vanilla JS forms.
 */

import { GoldSilverInput, IncomeZakatInput, CashSavingsInput, BusinessZakatInput, CorporateZakatInput } from '../types/modules';

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<keyof T | string, string>;
  data: T | null;
}

export interface FieldDescriptor {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  required: boolean;
  labelId: string;
  labelEn: string;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: Array<{ value: string; labelId: string; labelEn: string }>;
  helperTextId?: string;
  helperTextEn?: string;
}

/**
 * 1. Gold & Silver Form Validator
 */
export function validateGoldSilverForm(raw: Record<string, any>): ValidationResult<GoldSilverInput> {
  const errors: Record<string, string> = {};

  const grams = raw.goldGrams !== undefined && raw.goldGrams !== '' ? Number(raw.goldGrams) : 0;
  if (isNaN(grams) || grams < 0) {
    errors['goldGrams'] = 'Berat emas harus berupa angka positif (gram).';
  }

  const karat = raw.goldPurityKarat !== undefined && raw.goldPurityKarat !== '' ? Number(raw.goldPurityKarat) : 24;
  if (isNaN(karat) || karat < 1 || karat > 24) {
    errors['goldPurityKarat'] = 'Kadar karat emas harus antara 1 sampai 24 karat.';
  }

  const price = raw.goldPricePerGram !== undefined && raw.goldPricePerGram !== '' ? Number(raw.goldPricePerGram) : null;
  if (price !== null && (isNaN(price) || price <= 0)) {
    errors['goldPricePerGram'] = 'Harga emas per gram harus berupa angka lebih besar dari 0.';
  }

  const silverGrams = raw.silverGrams !== undefined && raw.silverGrams !== '' ? Number(raw.silverGrams) : 0;
  if (isNaN(silverGrams) || silverGrams < 0) {
    errors['silverGrams'] = 'Berat perak harus berupa angka positif (gram).';
  }

  const isValid = Object.keys(errors).length === 0;
  return {
    isValid,
    errors,
    data: isValid
      ? {
          goldGrams: grams,
          goldPurityKarat: karat,
          goldPricePerGram: price ?? undefined,
          silverGrams,
          isHawlFulfilled: raw.isHawlFulfilled !== undefined ? Boolean(raw.isHawlFulfilled) : true,
          currency: raw.currency ? String(raw.currency).toUpperCase() : undefined,
          locale: raw.locale ?? 'id'
        }
      : null
  };
}

/**
 * 2. Income Form Validator
 */
export function validateIncomeForm(raw: Record<string, any>): ValidationResult<IncomeZakatInput> {
  const errors: Record<string, string> = {};

  const gross = raw.grossIncome !== undefined && raw.grossIncome !== '' ? Number(raw.grossIncome) : NaN;
  if (isNaN(gross) || gross < 0) {
    errors['grossIncome'] = 'Penghasilan bruto wajib diisi dan bernilai positif.';
  }

  const expenses = raw.basicLivingExpenses !== undefined && raw.basicLivingExpenses !== '' ? Number(raw.basicLivingExpenses) : 0;
  if (isNaN(expenses) || expenses < 0) {
    errors['basicLivingExpenses'] = 'Kebutuhan pokok tidak boleh bernilai negatif.';
  }

  const debts = raw.dueDebtInstallment !== undefined && raw.dueDebtInstallment !== '' ? Number(raw.dueDebtInstallment) : 0;
  if (isNaN(debts) || debts < 0) {
    errors['dueDebtInstallment'] = 'Cicilan utang jatuh tempo tidak boleh bernilai negatif.';
  }

  const period = raw.period === 'annual' ? 'annual' : 'monthly';
  const method = raw.method === 'gross' ? 'gross' : 'net';

  const isValid = Object.keys(errors).length === 0;
  return {
    isValid,
    errors,
    data: isValid
      ? {
          grossIncome: gross,
          basicLivingExpenses: expenses,
          dueDebtInstallment: debts,
          period,
          method,
          useBaznasNisab: Boolean(raw.useBaznasNisab),
          goldPricePerGram: raw.goldPricePerGram !== undefined && raw.goldPricePerGram !== '' ? Number(raw.goldPricePerGram) : undefined,
          currency: raw.currency ? String(raw.currency).toUpperCase() : undefined,
          locale: raw.locale ?? 'id'
        }
      : null
  };
}

/**
 * 3. Cash & Savings Form Validator
 */
export function validateCashSavingsForm(raw: Record<string, any>): ValidationResult<CashSavingsInput> {
  const errors: Record<string, string> = {};

  const parseNonNegative = (val: any, field: string, label: string): number => {
    if (val === undefined || val === '') return 0;
    const num = Number(val);
    if (isNaN(num) || num < 0) {
      errors[field] = `${label} tidak boleh bernilai negatif.`;
      return 0;
    }
    return num;
  };

  const cash = parseNonNegative(raw.cashInHand, 'cashInHand', 'Uang tunai');
  const savings = parseNonNegative(raw.bankSavings, 'bankSavings', 'Tabungan bank');
  const deposits = parseNonNegative(raw.timeDeposits, 'timeDeposits', 'Deposito');
  const debts = parseNonNegative(raw.immediateDueDebts, 'immediateDueDebts', 'Utang jatuh tempo');

  const price = raw.goldPricePerGram !== undefined && raw.goldPricePerGram !== '' ? Number(raw.goldPricePerGram) : NaN;
  if (isNaN(price) || price <= 0) {
    errors['goldPricePerGram'] = 'Harga emas per gram harus diisi untuk menentukan batas nisab.';
  }

  const isValid = Object.keys(errors).length === 0;
  return {
    isValid,
    errors,
    data: isValid
      ? {
          cashInHand: cash,
          bankSavings: savings,
          timeDeposits: deposits,
          immediateDueDebts: debts,
          goldPricePerGram: price,
          isHawlFulfilled: raw.isHawlFulfilled !== undefined ? Boolean(raw.isHawlFulfilled) : true,
          currency: raw.currency ? String(raw.currency).toUpperCase() : undefined,
          locale: raw.locale ?? 'id'
        }
      : null
  };
}

/**
 * 4. Business Form Validator
 */
export function validateBusinessForm(raw: Record<string, any>): ValidationResult<BusinessZakatInput> {
  const errors: Record<string, string> = {};

  const inventory = raw.inventoryMarketValue !== undefined && raw.inventoryMarketValue !== '' ? Number(raw.inventoryMarketValue) : NaN;
  if (isNaN(inventory) || inventory < 0) {
    errors['inventoryMarketValue'] = 'Nilai pasar stok barang dagangan wajib diisi dan bernilai positif.';
  }

  const cash = raw.cashAndLiquidAssets !== undefined && raw.cashAndLiquidAssets !== '' ? Number(raw.cashAndLiquidAssets) : 0;
  if (isNaN(cash) || cash < 0) {
    errors['cashAndLiquidAssets'] = 'Kas dan aset lancar perniagaan tidak boleh bernilai negatif.';
  }

  const receivables = raw.goodReceivables !== undefined && raw.goodReceivables !== '' ? Number(raw.goodReceivables) : 0;
  if (isNaN(receivables) || receivables < 0) {
    errors['goodReceivables'] = 'Piutang lancar tidak boleh bernilai negatif.';
  }

  const debts = raw.dueOperationalDebts !== undefined && raw.dueOperationalDebts !== '' ? Number(raw.dueOperationalDebts) : 0;
  if (isNaN(debts) || debts < 0) {
    errors['dueOperationalDebts'] = 'Utang dagang jatuh tempo tidak boleh bernilai negatif.';
  }

  const price = raw.goldPricePerGram !== undefined && raw.goldPricePerGram !== '' ? Number(raw.goldPricePerGram) : NaN;
  if (isNaN(price) || price <= 0) {
    errors['goldPricePerGram'] = 'Harga emas per gram wajib diisi untuk nisab perniagaan (85g emas).';
  }

  const isValid = Object.keys(errors).length === 0;
  return {
    isValid,
    errors,
    data: isValid
      ? {
          inventoryMarketValue: inventory,
          cashAndLiquidAssets: cash,
          goodReceivables: receivables,
          dueOperationalDebts: debts,
          goldPricePerGram: price,
          isHawlFulfilled: raw.isHawlFulfilled !== undefined ? Boolean(raw.isHawlFulfilled) : true,
          currency: raw.currency ? String(raw.currency).toUpperCase() : undefined,
          locale: raw.locale ?? 'id'
        }
      : null
  };
}

/**
 * 5. Corporate Zakat Form Validator (AAOIFI Standard 35)
 */
export function validateCorporateForm(raw: Record<string, any>): ValidationResult<CorporateZakatInput> {
  const errors: Record<string, string> = {};

  const method = raw.method === 'net_equity' ? 'net_equity' : 'net_working_capital';

  const price = raw.goldPricePerGram !== undefined && raw.goldPricePerGram !== '' ? Number(raw.goldPricePerGram) : NaN;
  if (isNaN(price) || price <= 0) {
    errors['goldPricePerGram'] = 'Harga emas per gram wajib diisi untuk menentukan nisab perusahaan (85g emas).';
  }

  const parseNonNegative = (val: any, field: string, label: string): number => {
    if (val === undefined || val === '') return 0;
    const num = Number(val);
    if (isNaN(num) || num < 0) {
      errors[field] = `${label} tidak boleh bernilai negatif.`;
      return 0;
    }
    return num;
  };

  const currentAssets = parseNonNegative(raw.currentAssets, 'currentAssets', 'Aset lancar');
  const nonZakatable = parseNonNegative(raw.nonZakatableCurrentAssets, 'nonZakatableCurrentAssets', 'Aset lancar non-zakat');
  const currentLiabilities = parseNonNegative(raw.currentLiabilities, 'currentLiabilities', 'Liabilitas lancar');

  const paidUpCapital = parseNonNegative(raw.paidUpCapital, 'paidUpCapital', 'Modal disetor');
  const reserves = parseNonNegative(raw.reserves, 'reserves', 'Cadangan modal');
  const retainedEarnings = parseNonNegative(raw.retainedEarnings, 'retainedEarnings', 'Laba ditahan');

  const muslimOwnership = raw.muslimOwnershipPercentage !== undefined && raw.muslimOwnershipPercentage !== ''
    ? Number(raw.muslimOwnershipPercentage)
    : 100;

  if (isNaN(muslimOwnership) || muslimOwnership < 0 || muslimOwnership > 100) {
    errors['muslimOwnershipPercentage'] = 'Persentase kepemilikan saham Muslim harus antara 0% sampai 100%.';
  }

  const isValid = Object.keys(errors).length === 0;
  return {
    isValid,
    errors,
    data: isValid
      ? {
          method,
          currentAssets,
          nonZakatableCurrentAssets: nonZakatable,
          currentLiabilities,
          paidUpCapital,
          reserves,
          retainedEarnings,
          muslimOwnershipPercentage: muslimOwnership,
          goldPricePerGram: price,
          calendar: raw.calendar === 'hijri' ? 'hijri' : 'gregorian',
          currency: raw.currency ? String(raw.currency).toUpperCase() : undefined,
          locale: raw.locale ?? 'id'
        }
      : null
  };
}

/**
 * UI Form Field Descriptors for Dynamic Form Renderers (React/Vue/HTML)
 */
export const GOLD_FORM_DESCRIPTORS: FieldDescriptor[] = [
  {
    name: 'goldGrams',
    type: 'number',
    required: true,
    labelId: 'Berat Emas (Gram)',
    labelEn: 'Gold Weight (Grams)',
    placeholder: 'Contoh: 100',
    min: 0,
    helperTextId: 'Nisab emas adalah 85 gram emas murni.',
    helperTextEn: 'Gold nisab is 85 grams of pure gold.'
  },
  {
    name: 'goldPurityKarat',
    type: 'select',
    required: true,
    labelId: 'Kadar Karat Emas',
    labelEn: 'Gold Karat Purity',
    options: [
      { value: '24', labelId: '24 Karat (Murni 99.9%)', labelEn: '24 Karat (Pure 99.9%)' },
      { value: '22', labelId: '22 Karat (91.6%)', labelEn: '22 Karat (91.6%)' },
      { value: '18', labelId: '18 Karat (75.0%)', labelEn: '18 Karat (75.0%)' },
      { value: '14', labelId: '14 Karat (58.3%)', labelEn: '14 Karat (58.3%)' }
    ]
  },
  {
    name: 'goldPricePerGram',
    type: 'number',
    required: false,
    labelId: 'Harga Emas per Gram',
    labelEn: 'Gold Price per Gram',
    placeholder: 'Contoh: 1600000',
    min: 0,
    helperTextId: 'Kosongkan jika ingin memakai standar oracle default.',
    helperTextEn: 'Leave empty to use default oracle benchmark rate.'
  },
  {
    name: 'isHawlFulfilled',
    type: 'boolean',
    required: true,
    labelId: 'Sudah Tersimpan 1 Tahun (Haul)',
    labelEn: 'Held for 1 Full Year (Hawl)',
    helperTextId: 'Syarat wajib zakat emas adalah dimiliki selama 1 tahun penuh.',
    helperTextEn: 'Gold zakat requires continuous possession for one full year.'
  }
];
