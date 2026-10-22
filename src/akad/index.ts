/**
 * zakat-mal: Lafadz Niat, Ijab & Qabul (Akad Zakat) Generator
 * Official Shari'ah text formulation for UI checkouts and amil transactions.
 * Grounded in QS. At-Tawbah 9:103, Sahih Muslim 979, and Fiqh Jumhur.
 */

import { Locale, ZakatCategory } from '../types/common';

export type ZakatPayerType = 'self' | 'family_representative' | 'corporate';

export interface GenerateAkadInput {
  category: ZakatCategory;
  payerType?: ZakatPayerType;
  muzakkiName: string;
  representedPersonName?: string;
  companyName?: string;
  amount: number | string;
  currency: string;
  amilName?: string;
  institutionName?: string;
  locale?: Locale;
}

export interface ZakatNiatText {
  arabic: string;
  transliteration: string;
  translation: string;
  meaningNotes: string;
}

export interface ZakatQabulText {
  arabic: string;
  transliteration: string;
  translation: string;
  quranicReference: string;
}

export interface ZakatAkadPackage {
  payerType: ZakatPayerType;
  category: ZakatCategory;
  muzakkiName: string;
  amount: string;
  currency: string;
  niat: ZakatNiatText;
  doaPenerima: ZakatQabulText;
  ijabQabulSummary: string;
}

export function generateZakatAkad(input: GenerateAkadInput): ZakatAkadPackage {
  const locale = input.locale ?? 'id';
  const payerType = input.payerType ?? 'self';
  const currency = (input.currency || 'IDR').toUpperCase();
  const formattedAmount = `${input.amount} ${currency}`;

  // 1. Generate Niat
  let niat: ZakatNiatText;

  if (payerType === 'corporate') {
    const compName = input.companyName || input.muzakkiName || 'Perusahaan';
    niat = {
      arabic: 'نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِ هَذِهِ الشَّرِكَةِ فَرْضًا لِلَّهِ تَعَالَى',
      transliteration: "Nawaytu an ukhrija zakaata maali haadzihisy-syarikah fardhan lillaahi ta'aalaa.",
      translation: locale === 'en'
        ? `I intend to disburse the Zakat on the wealth of ${compName}, an obligation for the sake of Allah the Almighty.`
        : `Saya berniat mengeluarkan zakat harta perusahaan ${compName}, fardhu karena Allah Ta'ala.`,
      meaningNotes: locale === 'en'
        ? 'Corporate zakat intention formulated on behalf of legal entity shareholders.'
        : 'Niat zakat korporat/badan usaha mewakili para pemegang saham Muslim.'
    };
  } else if (payerType === 'family_representative' && input.representedPersonName) {
    const rep = input.representedPersonName;
    niat = {
      arabic: `نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْمَالِ عَنْ ${rep} فَرْضًا لِلَّهِ تَعَالَى`,
      transliteration: `Nawaytu an ukhrija zakaatal maali 'an ${rep} fardhan lillaahi ta'aalaa.`,
      translation: locale === 'en'
        ? `I intend to disburse the Zakat of wealth on behalf of ${rep}, an obligation for the sake of Allah the Almighty.`
        : `Saya berniat mengeluarkan zakat harta mewakili ${rep}, fardhu karena Allah Ta'ala.`,
      meaningNotes: locale === 'en'
        ? `Proxy intention disbursed on behalf of family member/principal: ${rep}.`
        : `Niat mewakili orang tua/istri/anak/kerabat (${rep}) dengan amanah perwakilan yang sah.`
    };
  } else {
    // Default: Self / Pribadi
    let categoryLabelId = 'harta saya';
    let categoryLabelEn = 'my wealth';

    if (input.category === 'income') {
      categoryLabelId = 'penghasilan / profesi saya';
      categoryLabelEn = 'my earned income';
    } else if (input.category === 'gold_silver') {
      categoryLabelId = 'emas dan perak saya';
      categoryLabelEn = 'my gold and silver';
    } else if (input.category === 'business') {
      categoryLabelId = 'perniagaan / usaha dagang saya';
      categoryLabelEn = 'my business trade';
    }

    niat = {
      arabic: 'نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى',
      transliteration: "Nawaytu an ukhrija zakaata maali fardhan lillaahi ta'aalaa.",
      translation: locale === 'en'
        ? `I intend to disburse the Zakat of ${categoryLabelEn}, an obligation for the sake of Allah the Almighty.`
        : `Saya berniat mengeluarkan zakat ${categoryLabelId}, fardhu karena Allah Ta'ala.`,
      meaningNotes: locale === 'en'
        ? 'Personal intention fulfilled at the moment of wealth allocation or payment submission.'
        : 'Niat pribadi ikhlas karena Allah SWT pada saat mengalokasikan atau mentransfer dana zakat.'
    };
  }

  // 2. Generate Doa Penerima / Amil
  const doaPenerima: ZakatQabulText = {
    arabic: 'آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ، وَبَارَكَ لَكَ فِيمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُورًا',
    transliteration: "Aajarakallaahu fiimaa a'thayta, wa baaraka laka fiimaa abqayta, wa ja'alahu laka thahuuraa.",
    translation: locale === 'en'
      ? 'May Allah reward you for what you have given, bless you in what you have retained, and make it a source of spiritual and financial purification for you.'
      : 'Semoga Allah memberikan pahala atas harta yang telah engkau serahkan, memberkahi harta yang masih engkau simpan, dan menjadikannya pembersih dosa dan hartamu.',
    quranicReference: 'QS. At-Tawbah (9:103) & Sunan An-Nasa\'i (No. 2458) - Doa Sunnah Amil / Penerima Zakat'
  };

  const amilLabel = input.amilName || input.institutionName || (locale === 'en' ? 'Authorized Amil' : 'Amil Zakat');
  const ijabQabulSummary = locale === 'en'
    ? `Zakat disbursement agreement: ${input.muzakkiName} has remitted ${formattedAmount} under category '${input.category}' to ${amilLabel}. May Allah accept the righteous deed.`
    : `Akad penyerahan zakat: ${input.muzakkiName} telah menyerahkan zakat ${formattedAmount} untuk kategori '${input.category}' melalui ${amilLabel}. Semoga Allah menerima amal sholeh ini.`;

  return {
    payerType,
    category: input.category,
    muzakkiName: input.muzakkiName,
    amount: formattedAmount,
    currency,
    niat,
    doaPenerima,
    ijabQabulSummary
  };
}
