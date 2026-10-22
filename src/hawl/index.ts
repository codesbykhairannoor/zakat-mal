/**
 * zakat-mal: Hawl Lifecycle & Continuity Engine
 * Analyzes multi-month ledger snapshots according to Classical Madhhab Rules.
 * Grounded in Sunan Abu Dawud 1573, Al-Majmu' Syarah Al-Muhadzdzab, and Radd al-Muhtar (Ibn Abidin).
 */

import { D, Decimal } from '../core/decimal';
import { ISLAMIC_CONSTANTS } from '../core/constants';
import { CalendarType, Locale } from '../types/common';
import { InvalidInputError } from '../core/errors';

export type MadhhabHawlRule = 'jumhur' | 'hanafi';

export interface LedgerSnapshot {
  date: string | Date;
  balance: number | string;
  note?: string;
}

export interface HawlTrackerInput {
  ledger: LedgerSnapshot[];
  goldPricePerGram: number | string;
  currency?: string;
  madhhab?: MadhhabHawlRule; // 'jumhur' (Shafi'i, Maliki, Hanbali) vs 'hanafi'
  calendar?: CalendarType;   // 'hijri' (354 days) vs 'gregorian' (365 days)
  customNisabValue?: number | string;
  currentDate?: string | Date;
  locale?: Locale;
}

export interface HawlEvent {
  date: string;
  type: 'hawl_started' | 'hawl_broken' | 'hawl_reset' | 'balance_zero' | 'hawl_matured';
  balance: string;
  nisab: string;
  description: string;
}

export interface HawlTrackerResult {
  status: 'matured' | 'active' | 'broken' | 'below_nisab';
  isZakatDueNow: boolean;
  madhhabApplied: MadhhabHawlRule;
  calendarApplied: CalendarType;
  currency: string;
  nisabThreshold: string;
  currentBalance: string;
  minimumBalanceObserved: string;
  hawlStartDate: string | null;
  hawlDueDate: string | null;
  daysElapsed: number;
  daysRemaining: number;
  percentCompleted: string;
  historyEvents: HawlEvent[];
  jurisprudentialExplanation: string;
}

const HIJRI_YEAR_DAYS = 354;
const GREGORIAN_YEAR_DAYS = 365;

export function trackHawlContinuity(input: HawlTrackerInput): HawlTrackerResult {
  const locale = input.locale ?? 'en';
  const currency = (input.currency || 'USD').toUpperCase();
  const madhhab = input.madhhab ?? 'jumhur';
  const calendar = input.calendar ?? 'hijri';
  const requiredDays = calendar === 'gregorian' ? GREGORIAN_YEAR_DAYS : HIJRI_YEAR_DAYS;

  const goldPrice = D(input.goldPricePerGram);
  if (goldPrice.lte(0)) {
    throw new InvalidInputError('Gold price per gram must be greater than zero.', 'goldPricePerGram');
  }

  const nisab = input.customNisabValue !== undefined
    ? D(input.customNisabValue)
    : goldPrice.mul(ISLAMIC_CONSTANTS.NISAB_GOLD_GRAMS);

  if (!input.ledger || input.ledger.length === 0) {
    throw new InvalidInputError('Ledger must contain at least one chronological snapshot.', 'ledger');
  }

  // Sort ledger chronologically
  const sorted = [...input.ledger].map(item => ({
    date: item.date instanceof Date ? item.date : new Date(item.date),
    balance: D(item.balance),
    note: item.note
  })).sort((a, b) => a.date.getTime() - b.date.getTime());

  const evaluationDate = input.currentDate
    ? (input.currentDate instanceof Date ? input.currentDate : new Date(input.currentDate))
    : new Date();

  const events: HawlEvent[] = [];
  let hawlStartDate: Date | null = null;
  let minimumBalanceObserved: Decimal = D(Infinity);
  let status: 'matured' | 'active' | 'broken' | 'below_nisab' = 'below_nisab';

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    if (!entry) continue;
    const dateStr = entry.date.toISOString().split('T')[0] ?? '';

    if (entry.balance.lt(minimumBalanceObserved)) {
      minimumBalanceObserved = entry.balance;
    }

    // 1. If Hawl has not started yet
    if (!hawlStartDate) {
      if (entry.balance.gte(nisab)) {
        hawlStartDate = entry.date;
        minimumBalanceObserved = entry.balance;
        status = 'active';
        events.push({
          date: dateStr,
          type: 'hawl_started',
          balance: entry.balance.toFixed(2),
          nisab: nisab.toFixed(2),
          description: locale === 'id'
            ? `Saldo mencapai nisab (${nisab.toFixed(2)} ${currency}). Haul 1 tahun (${requiredDays} hari) mulai berjalan.`
            : `Balance reached Nisab (${nisab.toFixed(2)} ${currency}). Hawl countdown initiated for ${requiredDays} days.`
        });
      }
      continue;
    }

    // 2. Hawl is currently running
    if (madhhab === 'jumhur') {
      // In Jumhur (Shafi'i, Maliki, Hanbali): any dip below nisab breaks hawl immediately
      if (entry.balance.lt(nisab)) {
        status = 'broken';
        events.push({
          date: dateStr,
          type: 'hawl_broken',
          balance: entry.balance.toFixed(2),
          nisab: nisab.toFixed(2),
          description: locale === 'id'
            ? `Saldo anjlok di bawah nisab (${entry.balance.toFixed(2)} < ${nisab.toFixed(2)} ${currency}). Menurut jumhur (Syafi'i, Maliki, Hanbali), haul terputus (munqathi').`
            : `Balance fell below Nisab (${entry.balance.toFixed(2)} < ${nisab.toFixed(2)} ${currency}). Under Jumhur (Shafi'i, Maliki, Hanbali), Hawl is invalidated.`
        });
        hawlStartDate = null; // Reset hawl
      }
    } else {
      // In Hanafi: only complete loss of wealth (balance <= 0) breaks hawl mid-year
      if (entry.balance.lte(0)) {
        status = 'broken';
        events.push({
          date: dateStr,
          type: 'balance_zero',
          balance: entry.balance.toFixed(2),
          nisab: nisab.toFixed(2),
          description: locale === 'id'
            ? `Harta habis total (istihlak / saldo 0). Menurut madzhab Hanafi, haul terputus total.`
            : `Wealth completely exhausted (zero balance). Under Hanafi madhhab, Hawl is terminated.`
        });
        hawlStartDate = null;
      }
    }
  }

  const latestEntry = sorted[sorted.length - 1] ?? { balance: D(0) };
  const currentBalance = latestEntry.balance;

  // Calculate elapsed days if hawl is active
  let daysElapsed = 0;
  let daysRemaining = requiredDays;
  let hawlDueDateStr: string | null = null;
  let percentCompleted = '0.0%';

  if (hawlStartDate) {
    const dueDate = new Date(hawlStartDate.getTime() + requiredDays * 24 * 60 * 60 * 1000);
    hawlDueDateStr = dueDate.toISOString().split('T')[0] ?? null;

    const elapsedMs = evaluationDate.getTime() - hawlStartDate.getTime();
    daysElapsed = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
    daysRemaining = Math.max(0, requiredDays - daysElapsed);

    const ratio = Math.min(100, (daysElapsed / requiredDays) * 100);
    percentCompleted = `${ratio.toFixed(1)}%`;

    if (daysElapsed >= requiredDays) {
      if (currentBalance.gte(nisab)) {
        status = 'matured';
        events.push({
          date: evaluationDate.toISOString().split('T')[0] ?? '',
          type: 'hawl_matured',
          balance: currentBalance.toFixed(2),
          nisab: nisab.toFixed(2),
          description: locale === 'id'
            ? `Haul genap 1 tahun penuh (${daysElapsed}/${requiredDays} hari) dan saldo tetap di atas nisab. ZAKAT WAJIB DITUNAIKAN SEGERA!`
            : `Hawl completed 1 full year (${daysElapsed}/${requiredDays} days) with balance maintaining Nisab. ZAKAT IS DUE IMMEDIATELY!`
        });
      } else {
        status = 'below_nisab';
      }
    } else {
      status = 'active';
    }
  } else {
    status = currentBalance.gte(nisab) ? 'active' : 'below_nisab';
  }

  const explanation = madhhab === 'hanafi'
    ? (locale === 'id'
        ? 'Aturan Madzhab Hanafi: Syarat nisab diuji pada awal haul (ibtida\') dan akhir haul (intaha\'). Fluktuasi di tengah tahun tidak membatalkan haul kecuali harta habis total (shifr).'
        : 'Hanafi Madhhab Standard: Nisab is verified at the start (ibtida\') and conclusion (intaha\') of the Hawl. Mid-year dips do not invalidate Hawl unless wealth is completely exhausted.')
    : (locale === 'id'
        ? 'Aturan Jumhur Fuqaha (Syafi\'i, Maliki, Hanbali): Saldo wajib bertahan di atas nisab secara terus-menerus tanpa jeda selama 354 hari. Bila anjlok di bawah nisab, haul batal dan wajib dimulai dari nol saat mencapai nisab lagi.'
        : 'Jumhur Standard (Shafi\'i, Maliki, Hanbali): Wealth must continuously maintain Nisab without interruption for 354 days. Any drop below Nisab restarts the Hawl from zero upon re-reaching Nisab.');

  return {
    status,
    isZakatDueNow: status === 'matured',
    madhhabApplied: madhhab,
    calendarApplied: calendar,
    currency,
    nisabThreshold: nisab.toFixed(2),
    currentBalance: currentBalance.toFixed(2),
    minimumBalanceObserved: minimumBalanceObserved === D(Infinity) ? currentBalance.toFixed(2) : minimumBalanceObserved.toFixed(2),
    hawlStartDate: hawlStartDate ? (hawlStartDate.toISOString().split('T')[0] ?? null) : null,
    hawlDueDate: hawlDueDateStr,
    daysElapsed,
    daysRemaining,
    percentCompleted,
    historyEvents: events,
    jurisprudentialExplanation: explanation
  };
}
