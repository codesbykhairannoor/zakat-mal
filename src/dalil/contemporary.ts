/**
 * zakat-mal: Contemporary Shariah Standards Database (AAOIFI, MUI, BAZNAS)
 */

import { DalilReference } from '../types/common';

export const CONTEMPORARY_DALIL: Record<string, DalilReference> = {
  AAOIFI_STANDARD_35_SOLAR_RATE: {
    id: 'aaoifi_standard_35_sec_4_1_4',
    category: 'aaoifi',
    title: 'AAOIFI Shari\'ah Standard No. 35: Tarif Zakat Tahun Masehi / Solar Year (2.577%)',
    titleEn: 'AAOIFI Shari\'ah Standard No. 35: Solar Year Zakat Rate Adjustment (2.577%)',
    source: 'AAOIFI Shari\'ah Standard No. 35 (Zakah), Section 4/1/4',
    arabicText: 'إذا حُسبت الزكاة وفقاً للسنة الشمسية، فإن النسبة الواجبة تُعدل لتصبح ٢,٥٧٧٪ بدلاً من ٢,٥٪ لمراعاة الفرق بين عدد أيام السنة الشمسية والسنة القمرية.',
    translationEn: 'If Zakah is calculated on the basis of a solar year (Gregorian), the due rate is adjusted to 2.577% instead of 2.5%, in order to account for the difference in days between the solar year (365.25 days) and the lunar year (354.36 days).',
    translationId: 'Jika zakat dihitung berdasarkan tahun matahari (Masehi/Gregorian), maka persentase kewajiban zakat disesuaikan menjadi 2.577% (bukan 2.5%) guna mengompensasi selisih 11 hari antara tahun masehi (365.25 hari) dan tahun hijriah (354.36 hari).',
    grade: 'Standar Syariah Internasional (AAOIFI)',
    relevance: 'Rujukan syariah perbankan dan akuntansi syariah global untuk penyesuaian tarif zakat perusahaan atau individu yang menggunakan pembukuan kalender Masehi.'
  },

  AAOIFI_STANDARD_35_CORPORATE_METHODS: {
    id: 'aaoifi_standard_35_sec_4_2',
    category: 'aaoifi',
    title: 'AAOIFI Shari\'ah Standard No. 35: Metode Perhitungan Zakat Perusahaan (Net Working Capital & Net Equity)',
    titleEn: 'AAOIFI Shari\'ah Standard No. 35: Corporate Zakat Calculation Methods (Net Working Capital & Net Equity)',
    source: 'AAOIFI Shari\'ah Standard No. 35 (Zakah), Section 4/2',
    arabicText: 'تُحسب زكاة المؤسسات بإحدى طريقتين متكافئتين: طريقة الموجودات الزكوية (رأس المال العامل الصافي)، أو طريقة مصادر الأموال الصافية (صافي الملكية).',
    translationEn: 'The zakah of institutions is calculated using one of two equivalent methods: the Net Zakatable Assets method (Net Working Capital), or the Net Financing Sources method (Net Equity).',
    translationId: 'Zakat institusi/perusahaan dihitung dengan salah satu dari dua metode yang bernilai setara: Metode Aset Lancar Bersih (Net Working Capital Approach) atau Metode Sumber Pendanaan Bersih (Net Equity Approach).',
    grade: 'Standar Syariah Internasional (AAOIFI)',
    relevance: 'Standar baku pelaporan keuangan syariah korporasi dan institusi keuangan syariah dunia untuk menentukan basis pengenaan zakat mal perusahaan.'
  },

  MUI_FATWA_INCOME_ZAKAT: {
    id: 'fatwa_mui_no_3_2003',
    category: 'contemporary_fatwa',
    title: 'Fatwa Majelis Ulama Indonesia No. 3 Tahun 2003: Zakat Penghasilan / Profesi',
    titleEn: 'MUI Fatwa No. 3 of 2003: Professional Income Zakat',
    source: 'Fatwa MUI No. 3 Tahun 2003 tentang Zakat Penghasilan',
    arabicText: 'تجب الزكاة في كل كسب حلال مستفاد كأجور العمل ورواتب الوظائف وأتعاب المهن الحرة متى بلغ نصاب الذهب (٨٥ جراماً) وحال عليه الحول أو عند قبضه.',
    translationEn: 'Zakat is obligatory on all lawful earned income such as wages, professional salaries, and consultancy fees whenever it reaches the gold nisab (85 grams of pure gold), either upon receipt or at the end of the year.',
    translationId: 'Semua bentuk penghasilan halal wajib dikeluarkan zakatnya dengan syarat telah mencapai nisab dalam satu tahun, yakni senilai 85 gram emas murni. Zakat penghasilan dapat dikeluarkan pada saat menerima (tiap bulan) dengan kadar 2.5%.',
    grade: 'Fatwa Majelis Ulama Indonesia (MUI)',
    relevance: 'Keputusan resmi para ulama Indonesia yang melegitimasi kewajiban zakat profesi/penghasilan bulanan dianalogikan dengan zakat emas/pertanian.'
  },

  BAZNAS_SK_NISAB_2026: {
    id: 'sk_ketua_baznas_no_15_2026',
    category: 'contemporary_fatwa',
    title: 'SK Ketua BAZNAS No. 15 Tahun 2026: Nilai Nisab Zakat Pendapatan dan Jasa',
    titleEn: 'BAZNAS Decree No. 15 of 2026: Official Income Zakat Nisab Benchmark',
    source: 'Surat Keputusan Ketua BAZNAS RI No. 15 Tahun 2026',
    arabicText: 'حد النصab لزكاة الدخل والمهن لعام ٢٠٢٦م محدد بمبلغ ٩١,٦٨١,٧٢٨ روبية سنوياً، أو ٧,٦٤٠,١٤٤ روبية شهرياً (معادل ٨٥ جراماً من الذهب).',
    translationEn: 'The nisab threshold for income and service zakat for the year 2026 is officially set at IDR 91,681,728 per year, or IDR 7,640,144 per month (equivalent to 85 grams of gold standard).',
    translationId: 'Nilai nisab zakat pendapatan dan jasa tahun 2026 ditetapkan sebesar Rp 91.681.728 per tahun atau Rp 7.640.144 per bulan (setara 85 gram emas acuan BAZNAS) dengan kadar 2.5%.',
    grade: 'Regulasi Resmi BAZNAS RI (SK No. 15/2026)',
    relevance: 'Ketetapan hukum amil zakat resmi Republik Indonesia yang menjadi rujukan nasional batas minimal kewajiban zakat penghasilan bruto/netto tahun 2026.'
  }
};
