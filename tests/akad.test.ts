import { describe, it, expect } from 'vitest';
import { generateZakatAkad } from '../src/akad';

describe('Lafadz Niat, Ijab & Qabul (Akad Zakat) Generator', () => {
  it('generates standard individual personal intention and receipt prayer', () => {
    const akad = generateZakatAkad({
      category: 'gold_silver',
      payerType: 'self',
      muzakkiName: 'Ahmad Khairan',
      amount: '3750000',
      currency: 'IDR',
      locale: 'id'
    });

    expect(akad.niat.arabic).toContain('نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي');
    expect(akad.niat.transliteration).toContain('Nawaytu an ukhrija zakaata maali');
    expect(akad.doaPenerima.arabic).toContain('آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ');
    expect(akad.doaPenerima.quranicReference).toContain('QS. At-Tawbah (9:103)');
  });

  it('generates proxy intention when paying on behalf of family members', () => {
    const akad = generateZakatAkad({
      category: 'income',
      payerType: 'family_representative',
      muzakkiName: 'Ahmad Khairan',
      representedPersonName: 'Fatimah Az-Zahra',
      amount: '500.00',
      currency: 'USD',
      locale: 'en'
    });

    expect(akad.niat.arabic).toContain('عَنْ Fatimah Az-Zahra');
    expect(akad.niat.translation).toContain('on behalf of Fatimah Az-Zahra');
  });

  it('generates corporate entity zakat intention', () => {
    const akad = generateZakatAkad({
      category: 'corporate',
      payerType: 'corporate',
      companyName: 'PT Berkah Syariah Global',
      muzakkiName: 'Direktur Utama',
      amount: '250000000',
      currency: 'IDR',
      locale: 'id'
    });

    expect(akad.niat.arabic).toContain('هَذِهِ الشَّرِكَةِ');
    expect(akad.niat.translation).toContain('PT Berkah Syariah Global');
  });
});
