import { describe, it, expect } from 'vitest';
import { generateZakatCertificate } from '../src/reports';
import { calculateGoldSilverZakat } from '../src/modules/gold-silver';

describe('Zakat Audit Certificate, Tax Deduction Slip & Reporting Engine', () => {
  it('generates an official verified Zakat Certificate with Asnaf schedule and tax notice', () => {
    const calc = calculateGoldSilverZakat({
      goldGrams: 100,
      goldPricePerGram: 1500000, // 100g * 1.5M * 2.5% = 3,750,000 IDR
      currency: 'IDR',
      locale: 'id'
    });

    const cert = generateZakatCertificate({
      result: calc,
      muzakkiName: 'Ir. Khairan Noor, M.Sc.',
      taxDetails: {
        taxIdNumber: '09.123.456.7-890.000',
        authorizedAmilName: 'BAZNAS Pusat'
      },
      locale: 'id'
    });

    expect(cert.certificateId).toMatch(/^ZK-[A-F0-9]{8}-[A-F0-9]{8}$/);
    expect(cert.totalZakatDue).toBe('3750000.00 IDR');
    expect(cert.taxDeductionEligible).toBe(true);
    expect(cert.asnafDistribution.length).toBe(8);

    // Fakir + Miskin gets 50% combined
    const fakir = cert.asnafDistribution.find(a => a.asnaf === 'fakir');
    const miskin = cert.asnafDistribution.find(a => a.asnaf === 'miskin');
    expect(fakir?.recommendedPercentage).toBe(25);
    expect(miskin?.recommendedPercentage).toBe(25);

    // Markdown & HTML formatting
    const md = cert.toMarkdown();
    expect(md).toContain('BUKTI SETOR ZAKAT');
    expect(md).toContain('Ir. Khairan Noor, M.Sc.');
    expect(md).toContain('09.123.456.7-890.000');

    const html = cert.toHtml();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('BUKTI SETOR ZAKAT / TAHKIK SERTIFIKAT');
    expect(html).toContain('3750000.00 IDR');
  });
});
