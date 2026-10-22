import { describe, it, expect } from 'vitest';
import { calculateLivestockZakat } from '../src/modules/livestock';

describe('Livestock Zakat Module (Al-An\'am)', () => {
  describe('Sheep & Goats (Ghanam)', () => {
    it('handles nisab boundary 0-39 (0) and 40 (1 syah)', () => {
      const below = calculateLivestockZakat({ animalType: 'sheep', count: 39 });
      expect(below.isObligatory).toBe(false);
      expect(below.details.itemsDue.length).toBe(0);

      const exact = calculateLivestockZakat({ animalType: 'sheep', count: 40 });
      expect(exact.isObligatory).toBe(true);
      expect(exact.details.itemsDue[0]?.quantity).toBe(1);
    });

    it('matches exact Hadith brackets: 120 (1), 121 (2), 200 (2), 201 (3), 300 (3), 400 (4), 550 (5)', () => {
      expect(calculateLivestockZakat({ animalType: 'sheep', count: 120 }).details.itemsDue[0]?.quantity).toBe(1);
      expect(calculateLivestockZakat({ animalType: 'sheep', count: 121 }).details.itemsDue[0]?.quantity).toBe(2);
      expect(calculateLivestockZakat({ animalType: 'sheep', count: 200 }).details.itemsDue[0]?.quantity).toBe(2);
      expect(calculateLivestockZakat({ animalType: 'sheep', count: 201 }).details.itemsDue[0]?.quantity).toBe(3);
      expect(calculateLivestockZakat({ animalType: 'sheep', count: 300 }).details.itemsDue[0]?.quantity).toBe(3);
      expect(calculateLivestockZakat({ animalType: 'sheep', count: 400 }).details.itemsDue[0]?.quantity).toBe(4);
      expect(calculateLivestockZakat({ animalType: 'sheep', count: 550 }).details.itemsDue[0]?.quantity).toBe(5);
    });
  });

  describe('Cattle & Cows (Baqar)', () => {
    it('handles 29 (0), 30 (1 Tabi\'), 40 (1 Musinnah)', () => {
      expect(calculateLivestockZakat({ animalType: 'cattle', count: 29 }).isObligatory).toBe(false);

      const res30 = calculateLivestockZakat({ animalType: 'cattle', count: 30 });
      expect(res30.isObligatory).toBe(true);
      expect(res30.details.itemsDue.some((i) => i.arabicTerm.includes('تَبِيع') && i.quantity === 1)).toBe(true);

      const res40 = calculateLivestockZakat({ animalType: 'cattle', count: 40 });
      expect(res40.details.itemsDue.some((i) => i.arabicTerm.includes('مُسِنَّة') && i.quantity === 1)).toBe(true);
    });

    it('calculates compound integer combinations: 60 (2 Tabi\'), 70 (1 Tabi\' + 1 Musinnah), 80 (2 Musinnah)', () => {
      const res60 = calculateLivestockZakat({ animalType: 'cattle', count: 60 });
      expect(res60.details.itemsDue.find((i) => i.arabicTerm.includes('تَبِيع'))?.quantity).toBe(2);

      const res70 = calculateLivestockZakat({ animalType: 'cattle', count: 70 });
      expect(res70.details.itemsDue.find((i) => i.arabicTerm.includes('تَبِيع'))?.quantity).toBe(1);
      expect(res70.details.itemsDue.find((i) => i.arabicTerm.includes('مُسِنَّة'))?.quantity).toBe(1);

      const res80 = calculateLivestockZakat({ animalType: 'cattle', count: 80 });
      expect(res80.details.itemsDue.find((i) => i.arabicTerm.includes('مُسِنَّة'))?.quantity).toBe(2);
    });
  });

  describe('Camels (Ibil)', () => {
    it('handles small camel herds with sheep zakat: 4 (0), 5 (1 syah), 24 (4 syah)', () => {
      expect(calculateLivestockZakat({ animalType: 'camel', count: 4 }).isObligatory).toBe(false);
      expect(calculateLivestockZakat({ animalType: 'camel', count: 5 }).details.itemsDue[0]?.quantity).toBe(1);
      expect(calculateLivestockZakat({ animalType: 'camel', count: 24 }).details.itemsDue[0]?.quantity).toBe(4);
    });

    it('handles age-based camel stages: 25 (1 Bint Makhadh), 36 (1 Bint Labun), 46 (1 Hiqqah), 61 (1 Jadz\'ah), 76 (2 Bint Labun), 91 (2 Hiqqah)', () => {
      const res25 = calculateLivestockZakat({ animalType: 'camel', count: 25 });
      expect(res25.details.itemsDue[0]?.arabicTerm).toContain('بِنْت مَخَاض');

      const res36 = calculateLivestockZakat({ animalType: 'camel', count: 36 });
      expect(res36.details.itemsDue[0]?.arabicTerm).toContain('بِنْت لَبُون');

      const res46 = calculateLivestockZakat({ animalType: 'camel', count: 46 });
      expect(res46.details.itemsDue[0]?.arabicTerm).toContain('حِقَّة');

      const res61 = calculateLivestockZakat({ animalType: 'camel', count: 61 });
      expect(res61.details.itemsDue[0]?.arabicTerm).toContain('جَذَعَة');

      const res76 = calculateLivestockZakat({ animalType: 'camel', count: 76 });
      expect(res76.details.itemsDue[0]?.arabicTerm).toContain('بِنْتَا لَبُون');
      expect(res76.details.itemsDue[0]?.quantity).toBe(2);

      const res91 = calculateLivestockZakat({ animalType: 'camel', count: 91 });
      expect(res91.details.itemsDue[0]?.arabicTerm).toContain('حِقَّتَان');
      expect(res91.details.itemsDue[0]?.quantity).toBe(2);
    });

    it('calculates combinations for camels >= 121 (40 = 1 Bint Labun, 50 = 1 Hiqqah)', () => {
      // 130 camels = 2 Bint Labun (80) + 1 Hiqqah (50)
      const res130 = calculateLivestockZakat({ animalType: 'camel', count: 130 });
      expect(res130.details.itemsDue.find((i) => i.arabicTerm.includes('بِنْت لَبُون'))?.quantity).toBe(2);
      expect(res130.details.itemsDue.find((i) => i.arabicTerm.includes('حِقَّة'))?.quantity).toBe(1);

      // 140 camels = 1 Bint Labun (40) + 2 Hiqqah (100)
      const res140 = calculateLivestockZakat({ animalType: 'camel', count: 140 });
      expect(res140.details.itemsDue.find((i) => i.arabicTerm.includes('بِنْت لَبُون'))?.quantity).toBe(1);
      expect(res140.details.itemsDue.find((i) => i.arabicTerm.includes('حِقَّة'))?.quantity).toBe(2);
    });
  });

  describe('Conditions (Pastured vs Working)', () => {
    it('exempts non-pastured (ma\'lufah) animals from zakat', () => {
      const res = calculateLivestockZakat({
        animalType: 'sheep',
        count: 100,
        isPastured: false
      });
      expect(res.isObligatory).toBe(false);
      expect(res.notes.some((n) => n.toLowerCase().includes('stall-fed') || n.toLowerCase().includes('forage'))).toBe(true);

      const resId = calculateLivestockZakat({
        animalType: 'sheep',
        count: 100,
        isPastured: false,
        locale: 'id'
      });
      expect(resId.notes.some((n) => n.includes('pakan'))).toBe(true);
    });

    it('exempts working animals (\'amilah)', () => {
      const res = calculateLivestockZakat({
        animalType: 'cattle',
        count: 50,
        isWorkingAnimal: true
      });
      expect(res.isObligatory).toBe(false);
      expect(res.notes.some((n) => n.toLowerCase().includes('working'))).toBe(true);

      const resId = calculateLivestockZakat({
        animalType: 'cattle',
        count: 50,
        isWorkingAnimal: true,
        locale: 'id'
      });
      expect(resId.notes.some((n) => n.includes('pekerja'))).toBe(true);
    });
  });
});
