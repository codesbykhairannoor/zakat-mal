/**
 * zakat-mal: Canonical Islamic Jurisprudence & Financial Constants
 * Grounded in Al-Qur'an, Sahih Hadith, AAOIFI Shari'ah Standard No. 35, and Fatwa MUI/BAZNAS.
 */

export const ISLAMIC_CONSTANTS = {
  // Gold & Silver Nisab standards
  NISAB_GOLD_GRAMS: 85, // 20 Mithqal / Dinar = 85 grams pure 24K gold
  NISAB_SILVER_GRAMS: 595, // 200 Dirhams = 5 Uqiyah = 595 grams pure silver

  // Agriculture standards (5 Wasaq = 300 Sa')
  NISAB_GRAIN_UNHUSKED_KG: 653, // Approx. 653 kg gabah (unhusked rice)
  NISAB_RICE_MILLED_KG: 520, // Approx. 520 kg beras (milled rice)
  NISAB_WHEAT_DATES_KG: 612, // Approx. 612 kg wheat/dates

  // Zakat Rates
  RATE_HIJRI_PERCENT: '2.5', // 2.5% = 1/40th for Lunar Hijri year (~354 days)
  RATE_HIJRI_DECIMAL: '0.025',

  // AAOIFI Shari'ah Standard No. 35, Section 4/1/4
  // Solar/Gregorian adjustment: 2.5% * (365.25 / 354.36) = 2.577%
  RATE_GREGORIAN_PERCENT: '2.577',
  RATE_GREGORIAN_DECIMAL: '0.02577',

  // Agriculture Rates
  RATE_AGRICULTURE_NATURAL_PERCENT: '10.0', // Rain-fed / river / springs (Al-'Usyr = 1/10)
  RATE_AGRICULTURE_NATURAL_DECIMAL: '0.10',

  RATE_AGRICULTURE_ARTIFICIAL_PERCENT: '5.0', // Irrigated / purchased water / pumps (Nisf al-'Usyr = 1/20)
  RATE_AGRICULTURE_ARTIFICIAL_DECIMAL: '0.05',

  RATE_AGRICULTURE_MIXED_PERCENT: '7.5', // Mixed / shared irrigation (3/40)
  RATE_AGRICULTURE_MIXED_DECIMAL: '0.075',

  // Rikaz & Mining Rates
  RATE_RIKAZ_PERCENT: '20.0', // Buried ancient treasure (Al-Khumus = 1/5)
  RATE_RIKAZ_DECIMAL: '0.20',

  RATE_MINING_PERCENT: '2.5', // Extracted mineral ores (2.5%)
  RATE_MINING_DECIMAL: '0.025',

  // Rental Yield (Mustaghallat)
  RATE_RENTAL_YIELD_RECEIPT_PERCENT: '10.0', // 10% on net yield upon receipt (Qaradawi / Majma' al-Fiqh)
  RATE_RENTAL_YIELD_RECEIPT_DECIMAL: '0.10',

  RATE_RENTAL_YIELD_ANNUAL_PERCENT: '2.5', // 2.5% on accumulated surplus after 1 year
  RATE_RENTAL_YIELD_ANNUAL_DECIMAL: '0.025',

  // BAZNAS Official Decree (SK Ketua BAZNAS No. 15 Tahun 2026)
  NISAB_INCOME_BAZNAS_2026_ANNUAL: '91681728', // Rp 91.681.728 / tahun
  NISAB_INCOME_BAZNAS_2026_MONTHLY: '7640144' // Rp 7.640.144 / bulan
} as const;
