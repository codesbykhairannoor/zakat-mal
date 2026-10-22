/**
 * zakat-mal: Internationalization (i18n) Engine
 * Supports English ('en'), Indonesian ('id'), and Arabic ('ar').
 * English is the global default.
 */

import { Locale } from '../types/common';

export const TRANSLATIONS = {
  en: {
    obligatory: 'ZAKAT OBLIGATORY (Nisab & Hawl Reached)',
    not_obligatory: 'NOT OBLIGATORY (Below Nisab or Hawl Incomplete)',
    gold_nisab_not_reached: 'Gold weight ({weight}g pure) has not reached the Nisab of {nisab}g.',
    silver_nisab_not_reached: 'Silver weight ({weight}g pure) has not reached the Nisab of {nisab}g.',
    hawl_not_fulfilled: 'Zakat liability has not matured because the Hawl requirement (1 full year of continuous ownership) is not fulfilled.',
    personal_jewelry_exempt: 'Customary personal jewelry worn within reasonable limits is exempt from Zakat according to the majority of scholars (Jumhur: Maliki, Shafi\'i, Hanbali).',
    savings_below_nisab: 'Net liquid savings ({amount} {currency}) are below the Nisab threshold ({nisab} {currency}).',
    debt_deducted: 'Immediate short-term operational debts due ({amount} {currency}) have been deducted from liquid assets.',
    business_below_nisab: 'Business zakatable base ({amount} {currency}) is below the 85g gold Nisab ({nisab} {currency}).',
    net_income_below_nisab: 'Net earnings ({amount} {currency}) are below the {period} Nisab threshold ({nisab} {currency}).',
    essential_expenses_deducted: 'Essential basic living expenses (Hajah Ashliyyah: {expenses}) and due debt payments ({debts}) have been deducted from gross income.',
    agriculture_no_hawl: 'Agricultural produce zakat has no 1-year Hawl requirement; it is due immediately upon harvest day (Surah Al-An\'am 6:141).',
    agriculture_below_nisab: 'Net harvest ({weight} kg) is below the Nisab of 5 Wasaq ({nisab} kg).',
    agriculture_costs_deducted: 'Operational cultivation/harvest costs ({amount} kg equivalent) have been deducted from the gross harvest.',
    livestock_below_nisab: 'Livestock count ({count} head) has not reached the minimum Nisab of {nisab} head.',
    livestock_non_pastured_exempt: 'Stall-fed / forage-fed livestock (Ma\'lufah) incurring daily commercial feeding expenses are exempt according to the majority of scholars.',
    livestock_working_exempt: 'Working animals used for agriculture, plowing, or transport (\'Amilah) are exempt from Zakat.',
    corporate_aaoifi_applied: 'Corporate zakat calculated in accordance with AAOIFI Shari\'ah Standard No. 35 on Zakah ({method}).',
    corporate_solar_applied: 'Applied AAOIFI Standard 35 Section 4/1/4 solar rate adjustment (2.577%) for the 365-day fiscal year.',
    corporate_muslim_share: 'Zakat obligation is restricted to the equity proportion of Muslim shareholders ({percentage}%).',
    corporate_below_nisab: 'Corporate Muslim zakatable base ({amount} {currency}) is below the Nisab threshold ({nisab} {currency}).',
    investments_below_nisab: 'Investment portfolio capital ({amount} {currency}) is below the gold Nisab threshold ({nisab} {currency}).',
    investments_dividend_rule: 'Long-term investment stocks are subject to a 10% rate on net dividend income (Qiyas \'Ala az-Zuru\').',
    crypto_commodity_treated: 'Digital crypto assets are evaluated as monetary wealth / trade merchandise (\'Urud at-Tijarah) based on prevailing market value.',
    crypto_below_nisab: 'Crypto asset value ({amount} {currency}) is below the 85g gold Nisab ({nisab} {currency}).',
    rental_capital_exempt: 'Physical rental property/building is exempt from Zakat as fixed capital; Zakat applies exclusively to net rental income yield (Al-Mustaghallat).',
    rental_below_nisab: 'Net rental yield ({amount} {currency}) is below the 85g gold Nisab ({nisab} {currency}).',
    rental_deductions_applied: 'Maintenance, taxes, and operational expenses ({amount} {currency}) have been deducted.',
    rikaz_khumus_rule: 'Rikaz (ancient buried treasure discovered without mining cost) is subject to an unconditional 20% rate (Al-Khumus) without a Nisab threshold.',
    rikaz_mining_no_hawl: 'Rikaz and mining zakat do not require a 1-year Hawl; they are due immediately upon extraction.',
    mining_below_nisab: 'Mined mineral extraction ({amount} {currency}) is below the 85g gold Nisab ({nisab} {currency}).',
    portfolio_summary: 'Successfully calculated {total} asset categories: {obligatory} categories reached Nisab and are subject to Zakat.'
  },
  id: {
    obligatory: 'WAJIB ZAKAT (Mencapai Nisab & Haul)',
    not_obligatory: 'BELUM WAJIB ZAKAT (Di Bawah Nisab atau Haul Belum Genap)',
    gold_nisab_not_reached: 'Berat emas ({weight}g murni) belum mencapai nisab {nisab}g.',
    silver_nisab_not_reached: 'Berat perak ({weight}g murni) belum mencapai nisab {nisab}g.',
    hawl_not_fulfilled: 'Kewajiban zakat belum jatuh tempo karena syarat haul (1 tahun kepemilikan) belum terpenuhi.',
    personal_jewelry_exempt: 'Emas perhiasan yang dipakai secara wajar (tidak berlebih-lebihan) dikecualikan dari zakat menurut jumhur fuqaha.',
    savings_below_nisab: 'Saldo simpanan bersih ({amount} {currency}) belum mencapai batas nisab ({nisab} {currency}).',
    debt_deducted: 'Utang jangka pendek jatuh tempo ({amount} {currency}) telah dikurangkan dari aset lancar.',
    business_below_nisab: 'Basis zakat perdagangan ({amount} {currency}) belum mencapai nisab 85g emas ({nisab} {currency}).',
    net_income_below_nisab: 'Penghasilan bersih ({amount} {currency}) belum mencapai batas nisab {period} ({nisab} {currency}).',
    essential_expenses_deducted: 'Pengeluaran kebutuhan pokok primer (hajah ashliyyah: {expenses}) dan cicilan utang jatuh tempo ({debts}) telah dikurangkan dari bruto.',
    agriculture_no_hawl: 'Zakat pertanian tidak mensyaratkan berlalunya haul 1 tahun; wajib ditunaikan seketika pada hari panen (QS. Al-An\'am: 141).',
    agriculture_below_nisab: 'Hasil panen bersih ({weight} kg) belum mencapai nisab 5 wasaq ({nisab} kg).',
    agriculture_costs_deducted: 'Biaya operasional panen/tanam ({amount} kg ekuivalen) telah dikurangkan dari bruto.',
    livestock_below_nisab: 'Jumlah hewan ternak ({count} ekor) belum mencapai nisab minimal {nisab} ekor.',
    livestock_non_pastured_exempt: 'Hewan ternak ma\'lufah (yang diberi pakan komersial/dikeluarkan biaya sehari-hari) tidak wajib zakat menurut jumhur fuqaha.',
    livestock_working_exempt: 'Hewan pekerja (untuk membajak sawah atau transportasi) tidak wajib zakat.',
    corporate_aaoifi_applied: 'Perhitungan zakat korporasi mengacu pada AAOIFI Shari\'ah Standard No. 35 tentang Zakah ({method}).',
    corporate_solar_applied: 'Menggunakan tarif tahun Masehi 2.577% sesuai klausul AAOIFI Standard 35 Section 4/1/4 untuk periode buku 365 hari.',
    corporate_muslim_share: 'Kewajiban zakat hanya dibebankan pada porsi kepemilikan pemegang saham Muslim ({percentage}%).',
    corporate_below_nisab: 'Basis zakat korporasi Muslim ({amount} {currency}) belum mencapai batas nisab ({nisab} {currency}).',
    investments_below_nisab: 'Portofolio investasi modal ({amount} {currency}) belum mencapai nisab emas ({nisab} {currency}).',
    investments_dividend_rule: 'Saham investasi jangka panjang dikenakan zakat dividen 10% atas dividen bersih yang diterima (Qiyas \'Ala az-Zuru\').',
    crypto_commodity_treated: 'Aset kripto diperlakukan sebagai harta moneter / komoditas perdagangan (\'Urud at-Tijarah) berdasarkan harga pasar.',
    crypto_below_nisab: 'Nilai aset kripto ({amount} {currency}) belum mencapai batas nisab 85g emas ({nisab} {currency}).',
    rental_capital_exempt: 'Aset fisik gedung/properti sewaan bebas dari zakat; zakat hanya dikenakan atas pendapatan hasil sewa bersih (al-mustaghallat).',
    rental_below_nisab: 'Hasil sewa bersih ({amount} {currency}) belum mencapai batas nisab 85g emas ({nisab} {currency}).',
    rental_deductions_applied: 'Biaya pemeliharaan, pajak, dan operasional ({amount} {currency}) telah dikurangkan.',
    rikaz_khumus_rule: 'Rikaz (harta karun temuan purbakala) dikenakan tarif mutlak 20% tanpa batas nisab.',
    rikaz_mining_no_hawl: 'Zakat rikaz dan ma\'din tidak mensyaratkan berlalunya haul 1 tahun; wajib ditunaikan seketika saat diperoleh atau diekstraksi.',
    mining_below_nisab: 'Hasil tambang ({amount} {currency}) belum mencapai nisab 85g emas ({nisab} {currency}).',
    portfolio_summary: 'Berhasil menghitung {total} kategori aset: {obligatory} kategori mencapai nisab dan wajib ditunaikan zakatnya.'
  },
  ar: {
    obligatory: 'واجبة الزكاة (بلغت النصاب وحال عليها الحول)',
    not_obligatory: 'غير واجبة (دون النصاب أو لم يحل الحول)',
    gold_nisab_not_reached: 'وزن الذهب الخالص ({weight} غرام) لم يبلغ النصاب ({nisab} غرام).',
    silver_nisab_not_reached: 'وزن الفضة الخالصة ({weight} غرام) لم يبلغ النصاب ({nisab} غرام).',
    hawl_not_fulfilled: 'لم تجب الزكاة لعدم تمام شرط الحول (مرور سنة قمرية كاملة).',
    personal_jewelry_exempt: 'الحلي المباح للاستعمال المعتاد لا زكاة فيه عند جمهور الفقهاء.',
    savings_below_nisab: 'صافي المدخرات النقدية ({amount} {currency}) دون حد النصاب ({nisab} {currency}).',
    debt_deducted: 'تم خصم الديون الحالة العاجلة ({amount} {currency}) من الأصول الزكوية.',
    business_below_nisab: 'وعاء عروض التجارة ({amount} {currency}) دون نصاب الذهب ({nisab} {currency}).',
    net_income_below_nisab: 'صافي الدخل ({amount} {currency}) دون حد النصاب {period} ({nisab} {currency}).',
    essential_expenses_deducted: 'تم خصم النفقات الأصلية المعيشية وأقساط الديون الحالة من الدخل الإجمالي.',
    agriculture_no_hawl: 'لا يشترط الحول في زكاة الزروع والثمار؛ بل تجب عند الحصاد والجذاذ (سورة الأنعام: ١٤١).',
    agriculture_below_nisab: 'صافي المحصول ({weight} كغ) دون نصاب خمسة أوسق ({nisab} كغ).',
    agriculture_costs_deducted: 'تم خصم تكاليف الحصاد والعمل من إجمالي المحصول.',
    livestock_below_nisab: 'عدد الماشية ({count} رأس) لم يبلغ النصاب ({nisab} رأس).',
    livestock_non_pastured_exempt: 'الماشية المعلوفة التي ينفق عليها لا زكاة فيها عند جمهور العلماء.',
    livestock_working_exempt: 'العوامل من الإبل والبقر لا زكاة فيها.',
    corporate_aaoifi_applied: 'حُسبت زكاة الشركات وفق معيار الأيوفي الشرعي رقم ٣٥ بشأن الزكاة ({method}).',
    corporate_solar_applied: 'طُبقت النسبة الشمسية المعدلة ٢,٥٧٧٪ وفق معيار أيوفي ٣٥ فقرة ٤/١/٤.',
    corporate_muslim_share: 'اقتصرت الزكاة على حصة المساهمين المسلمين ({percentage}٪).',
    corporate_below_nisab: 'وعاء زكاة المساهمين المسلمين ({amount} {currency}) دون النصاب ({nisab} {currency}).',
    investments_below_nisab: 'رأس مال المحفظة الاستثمارية ({amount} {currency}) دون نصاب الذهب ({nisab} {currency}).',
    investments_dividend_rule: 'الأسهم الاستثمارية طويلة الأجل تزكى بنسبة ١٠٪ من صافي ريع الأرباح (قياساً على الزروع).',
    crypto_commodity_treated: 'تُعامل الأصول المشفرة معاملة عروض التجارة أو الأثمان بحسب قيمتها السوقية.',
    crypto_below_nisab: 'قيمة العملات الرقمية ({amount} {currency}) دون نصاب الذهب ({nisab} {currency}).',
    rental_capital_exempt: 'الأصل الثابت المؤجر معفى من الزكاة؛ وإنما الزكاة في صافي غلته (المستغلات).',
    rental_below_nisab: 'صافي الإيجار ({amount} {currency}) دون نصاب الذهب ({nisab} {currency}).',
    rental_deductions_applied: 'تم خصم تكاليف الصيانة والضرائب والنفقات التشغيلية ({amount} {currency}).',
    rikaz_khumus_rule: 'في الركاز الخمس (٢٠٪) واجباً دون اشتراط نصاب ولا حول.',
    rikaz_mining_no_hawl: 'لا يشترط الحول في الركاز والمعادن؛ بل تجب زكاتها فور استخراجها.',
    mining_below_nisab: 'المعادن المستخرجة ({amount} {currency}) دون نصاب الذهب ({nisab} {currency}).',
    portfolio_summary: 'تم حساب {total} فئات زكوية: {obligatory} فئات بلغت النصاب وتجب زكاتها.'
  }
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;

export function t(key: TranslationKey, locale: Locale = 'en', params: Record<string, string | number> = {}): string {
  const dict = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
  let text: string = (dict as any)[key] ?? (TRANSLATIONS.en as any)[key] ?? key;

  for (const [paramKey, paramVal] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
  }

  return text;
}
