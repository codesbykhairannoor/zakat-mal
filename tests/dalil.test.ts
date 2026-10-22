import { describe, it, expect } from 'vitest';
import {
  getAllDalils,
  getDalilById,
  getDalilsForCategory,
  searchDalil,
  QURAN_DALIL,
  HADITH_DALIL,
  CONTEMPORARY_DALIL
} from '../src/dalil';

describe('Dalil & Shariah Source Retrieval Engine', () => {
  it('retrieves all dalils including Quran, Sahih Hadith, AAOIFI, and Fatwa MUI', () => {
    const dalils = getAllDalils();
    expect(dalils.length).toBeGreaterThanOrEqual(10);

    const categories = new Set(dalils.map((d) => d.category));
    expect(categories.has('quran')).toBe(true);
    expect(categories.has('hadith')).toBe(true);
    expect(categories.has('aaoifi')).toBe(true);
    expect(categories.has('contemporary_fatwa')).toBe(true);
  });

  it('retrieves exact dalil by ID', () => {
    const quran103 = getDalilById('quran_at_tawbah_103');
    expect(quran103).toBeDefined();
    expect(quran103?.source).toBe('QS. At-Tawbah (9:103)');
    expect(quran103?.arabicText).toContain('خُذْ مِنْ أَمْوَالِهِمْ');

    const hadithAbuDawud = getDalilById('hadith_abu_dawud_1573');
    expect(hadithAbuDawud).toBeDefined();
    expect(hadithAbuDawud?.arabicText).toContain('عِشْرُونَ دِينَارًا');
  });

  it('filters dalils by zakat asset category', () => {
    const goldDalils = getDalilsForCategory('gold_silver');
    expect(goldDalils.length).toBeGreaterThanOrEqual(3);
    expect(goldDalils.some((d) => d.id === 'hadith_abu_dawud_1573')).toBe(true);

    const agricultureDalils = getDalilsForCategory('agriculture');
    expect(agricultureDalils.some((d) => d.id === 'quran_al_anam_141')).toBe(true);
    expect(agricultureDalils.some((d) => d.id === 'hadith_bukhari_1483')).toBe(true);
  });

  it('searches dalils by keyword', () => {
    const searchRes = searchDalil('emas');
    expect(searchRes.length).toBeGreaterThan(0);

    const searchBukhari = searchDalil('Bukhari');
    expect(searchBukhari.length).toBeGreaterThanOrEqual(3);
  });
});
