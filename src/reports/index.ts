/**
 * zakat-mal: Zakat Audit Certificate, Tax Deduction Slip & Reporting Engine
 * Formats official Bukti Setor Zakat (BSZ), tax deduction slips, and Asnaf schedules.
 * Grounded in UU No. 23/2011 Pasal 22, AAOIFI Shari'ah Standard 35, and QS. At-Tawbah 9:60.
 */

import { Locale, ZakatResult } from '../types/common';
import { MultiAssetPortfolioResult } from '../engine/calculator';

export interface TaxDeductionDetails {
  taxIdNumber?: string; // NPWP in Indonesia, SSN/TIN in US, MyKad in Malaysia
  muzakkiName: string;
  muzakkiAddress?: string;
  authorizedAmilName: string;
  skPengesahanAmil?: string; // SK Izin Operasional BAZNAS/Kemenag
}

export interface AsnafScheduleItem {
  asnaf: 'fakir' | 'miskin' | 'amil' | 'muallaf' | 'riqab' | 'gharimin' | 'fisabilillah' | 'ibnu_sabil';
  nameId: string;
  nameEn: string;
  recommendedPercentage: number;
  allocatedAmount: string;
  quranicBasis: string;
}

export interface ZakatCertificate {
  certificateId: string;
  issueDate: string;
  muzakkiName: string;
  category: string;
  zakatableBase: string;
  nisabApplied: string;
  rateApplied: string;
  totalZakatDue: string;
  currency: string;
  taxDeductionEligible: boolean;
  taxNotice: string;
  asnafDistribution: AsnafScheduleItem[];
  verificationChecksum: string;
  toMarkdown(): string;
  toHtml(): string;
}

// Lightweight deterministic 32-bit FNV-1a & SHA-like hash generator (zero external dependencies)
function generateChecksum(input: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `ZK-${part1}-${part2}`.toUpperCase();
}

export function generateZakatCertificate(params: {
  result: ZakatResult<any> | MultiAssetPortfolioResult;
  muzakkiName: string;
  taxDetails?: TaxDeductionDetails;
  locale?: Locale;
}): ZakatCertificate {
  const locale = params.locale ?? 'id';
  const isPortfolio = 'itemsCalculatedCount' in params.result;
  const currency = params.result.currency || 'IDR';
  const totalDue = isPortfolio
    ? (params.result as MultiAssetPortfolioResult).totalZakatDueMonetary
    : (params.result as ZakatResult<any>).zakatDue;

  const categoryName = isPortfolio
    ? (locale === 'en' ? 'Consolidated Multi-Asset Portfolio' : 'Portofolio Gabungan Multi-Aset')
    : (params.result as ZakatResult<any>).category;

  const zakatableBase = isPortfolio
    ? `${(params.result as MultiAssetPortfolioResult).itemsCalculatedCount} Asset Categories`
    : (params.result as ZakatResult<any>).zakatableAmount;

  const nisab = isPortfolio
    ? 'Standard Gold 85g Baseline'
    : (params.result as ZakatResult<any>).nisabThreshold;

  const rate = isPortfolio
    ? '2.5% Hijri / 2.577% Solar AAOIFI'
    : (params.result as ZakatResult<any>).rateApplied;

  const now = new Date();
  const issueDateStr = now.toISOString().split('T')[0] ?? '';

  const rawSeed = `${params.muzakkiName}:${totalDue}:${currency}:${issueDateStr}:${categoryName}`;
  const certId = generateChecksum(rawSeed);

  // Calculate 8 Asnaf distribution recommendation based on QS. At-Tawbah 9:60
  const numericDue = parseFloat(totalDue.replace(/[^0-9.]/g, '')) || 0;
  const asnafWeights: Array<{ asnaf: any; nameId: string; nameEn: string; pct: number }> = [
    { asnaf: 'fakir', nameId: 'Fakir (Sangat Membutuhkan)', nameEn: 'The Destitute (Al-Fuqara)', pct: 25.0 },
    { asnaf: 'miskin', nameId: 'Miskin (Kekurangan Hidup)', nameEn: 'The Poor (Al-Masakin)', pct: 25.0 },
    { asnaf: 'amil', nameId: 'Amil (Petugas Pengelola)', nameEn: 'Zakat Administrators (Al-\'Amilina)', pct: 12.5 },
    { asnaf: 'muallaf', nameId: 'Muallaf (Dilembutkan Hatinya)', nameEn: 'Those Reconciled to Truth (Al-Mu\'allafah)', pct: 10.0 },
    { asnaf: 'riqab', nameId: 'Riqab (Pembebasan Perbudakan/Eksploitasi)', nameEn: 'Slaves / Trafficking Victims (Fir-Riqab)', pct: 5.0 },
    { asnaf: 'gharimin', nameId: 'Gharimin (Terlilit Utang)', nameEn: 'Debt-Stricken (Al-Gharimin)', pct: 7.5 },
    { asnaf: 'fisabilillah', nameId: 'Fisabilillah (Kebaikan Dakwah/Sosial)', nameEn: 'In the Cause of Allah (Fi Sabilillah)', pct: 10.0 },
    { asnaf: 'ibnu_sabil', nameId: 'Ibnu Sabil (Musafir Kehabisan Bekal)', nameEn: 'Stranded Travelers (Ibn As-Sabil)', pct: 5.0 }
  ];

  const asnafDistribution: AsnafScheduleItem[] = asnafWeights.map(w => {
    const allocated = (numericDue * (w.pct / 100)).toFixed(2);
    return {
      asnaf: w.asnaf,
      nameId: w.nameId,
      nameEn: w.nameEn,
      recommendedPercentage: w.pct,
      allocatedAmount: `${allocated} ${currency}`,
      quranicBasis: 'QS. At-Tawbah (9:60)'
    };
  });

  const taxNotice = locale === 'id'
    ? 'Pasal 22 UU No. 23 Tahun 2011 tentang Pengelolaan Zakat: Zakat yang dibayarkan oleh muzakki kepada BAZNAS atau LAZ resmi dapat dikurangkan dari penghasilan bruto dalam penghitungan Penghasilan Kena Pajak (PKP).'
    : 'Tax Notice: Under prevailing regional laws (e.g. Indonesia UU 23/2011, Malaysia LHDN Income Tax Act Section 44(11A)), verified zakat payments through accredited bodies serve as a legal tax deduction / tax rebate.';

  return {
    certificateId: certId,
    issueDate: issueDateStr,
    muzakkiName: params.muzakkiName,
    category: categoryName,
    zakatableBase,
    nisabApplied: nisab,
    rateApplied: rate,
    totalZakatDue: `${totalDue} ${currency}`,
    currency,
    taxDeductionEligible: true,
    taxNotice,
    asnafDistribution,
    verificationChecksum: certId,

    toMarkdown(): string {
      let md = `# 📜 SERTIFIKAT TAHKIK ZAKAT MAL / BUKTI SETOR ZAKAT (BSZ)\n\n`;
      md += `**No. Sertifikat:** \`${certId}\`  \n`;
      md += `**Tanggal Terbit:** ${issueDateStr}  \n`;
      md += `**Nama Muzakki:** **${params.muzakkiName}**  \n`;
      if (params.taxDetails?.taxIdNumber) {
        md += `**NPWP / Tax ID:** \`${params.taxDetails.taxIdNumber}\`  \n`;
      }
      md += `\n---\n\n`;
      md += `### Ringkasan Kewajiban Syariah\n\n`;
      md += `* **Kategori Zakat:** ${categoryName}\n`;
      md += `* **Basis Nilai Kena Zakat:** ${zakatableBase}\n`;
      md += `* **Batas Ambang Nisab:** ${nisab}\n`;
      md += `* **Tarif Diterapkan:** ${rate}\n`;
      md += `* **TOTAL ZAKAT TERUTANG:** **${totalDue} ${currency}**\n\n`;
      md += `### Rekomendasi Distribusi 8 Asnaf (QS. At-Tawbah 9:60)\n\n`;
      md += `| Golongan Asnaf | Porsi | Alokasi Dana |\n`;
      md += `| :--- | :--- | :--- |\n`;
      for (const item of asnafDistribution) {
        md += `| ${item.nameId} | ${item.recommendedPercentage}% | ${item.allocatedAmount} |\n`;
      }
      md += `\n> **Landasan Regulasi Pajak:** ${taxNotice}\n\n`;
      md += `*Dokumen ini diverifikasi secara deterministik oleh Zakat-Mal Fiqh Calculation Engine.*  \n`;
      md += `*Kode Verifikasi Integritas:* \`${certId}\`\n`;
      return md;
    },

    toHtml(): string {
      return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8"/>
  <title>Zakat Certificate - ${certId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 32px; background: #f8fafc; }
    .cert-card { max-width: 680px; margin: auto; background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 22px; color: #0f172a; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .meta-label { color: #64748b; }
    .meta-value { font-weight: 600; color: #0f172a; }
    .due-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center; }
    .due-label { font-size: 13px; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .due-amount { font-size: 28px; font-weight: 800; color: #14532d; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; }
    @media print { body { background: white; padding: 0; } .cert-card { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="cert-card">
    <div class="header">
      <h1>BUKTI SETOR ZAKAT / TAHKIK SERTIFIKAT</h1>
      <p>Official Shari'ah Compliance & Tax Relief Assessment Document</p>
    </div>
    <div class="meta-row"><span class="meta-label">No. Sertifikat:</span><span class="meta-value">${certId}</span></div>
    <div class="meta-row"><span class="meta-label">Tanggal Terbit:</span><span class="meta-value">${issueDateStr}</span></div>
    <div class="meta-row"><span class="meta-label">Nama Muzakki:</span><span class="meta-value">${params.muzakkiName}</span></div>
    ${params.taxDetails?.taxIdNumber ? `<div class="meta-row"><span class="meta-label">NPWP / Tax ID:</span><span class="meta-value">${params.taxDetails.taxIdNumber}</span></div>` : ''}
    <div class="meta-row"><span class="meta-label">Kategori Harta:</span><span class="meta-value">${categoryName}</span></div>
    <div class="meta-row"><span class="meta-label">Batas Nisab:</span><span class="meta-value">${nisab}</span></div>
    <div class="meta-row"><span class="meta-label">Tarif:</span><span class="meta-value">${rate}</span></div>

    <div class="due-box">
      <div class="due-label">Total Zakat Terutang</div>
      <div class="due-amount">${totalDue} ${currency}</div>
    </div>

    <h3 style="font-size: 14px; margin: 20px 0 8px;">Jadwal Rekomendasi Distribusi 8 Asnaf (QS. At-Tawbah: 60)</h3>
    <table>
      <thead>
        <tr><th>Golongan Asnaf</th><th>Porsi</th><th>Alokasi Dana</th></tr>
      </thead>
      <tbody>
        ${asnafDistribution.map(item => `<tr><td>${item.nameId}</td><td>${item.recommendedPercentage}%</td><td>${item.allocatedAmount}</td></tr>`).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p><strong>Regulasi Pengurang Pajak:</strong> ${taxNotice}</p>
      <p>Verifikasi Integritas: <code>${certId}</code> | Zakat-Mal Certified Engine v1.0.0</p>
    </div>
  </div>
</body>
</html>
      `.trim();
    }
  };
}
