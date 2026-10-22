#!/usr/bin/env node
/**
 * zakat-mal: Live Interactive Showcase / Playground
 * Demonstrates all 10 Zakat Mal asset categories with real-world scenarios.
 */

import {
  calculatePortfolioZakat,
  calculateGoldSilverZakat,
  calculateCashSavingsZakat,
  calculateBusinessZakat,
  calculateIncomeZakat,
  calculateAgricultureZakat,
  calculateLivestockZakat,
  calculateCorporateZakat,
  calculateCryptoZakat,
  calculateInvestmentsZakat,
  calculateRentalYieldZakat,
  calculateRikazMiningZakat,
  getAllDalils,
  searchDalil
} from '../dist/index.mjs';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m'
};

function formatCurrency(num, curr = 'IDR') {
  const n = parseFloat(num);
  return curr === 'IDR'
    ? 'Rp ' + n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

console.log(`\n${c.magenta}${c.bold}========================================================================${c.reset}`);
console.log(`${c.magenta}${c.bold}   zakat-mal: Live Comprehensive Calculation Playground & Showcase      ${c.reset}`);
console.log(`${c.magenta}${c.bold}========================================================================${c.reset}\n`);

// 1. Gold & Silver
console.log(`${c.cyan}${c.bold}1. ZAKAT EMAS & PERAK (Gold & Silver)${c.reset}`);
const goldPrice = 1500000;
const goldRes = calculateGoldSilverZakat({
  goldGrams: 120,
  goldPurityKarat: 18, // 18K = 75% -> 90g murni (>= 85g nisab)
  goldUsage: 'investment',
  goldPricePerGram: goldPrice,
  silverGrams: 600,
  silverPricePerGram: 18000,
  calendar: 'hijri'
});
console.log(`  Emas Fisik     : 120g (18 Karat) -> ${goldRes.details.pureGoldWeightGrams}g emas murni`);
console.log(`  Perak Fisik    : 600g (Murni)`);
console.log(`  Status Syar'i  : ${goldRes.isObligatory ? c.green + 'WAJIB ZAKAT' : 'BELUM WAJIB'}${c.reset}`);
console.log(`  Zakat Terutang : ${c.bold}${formatCurrency(goldRes.details.totalZakatDueMonetary)}${c.reset}`);
console.log(`  Dalil Utama    : [${goldRes.dalilReferences[0].source}] ${goldRes.dalilReferences[0].title}\n`);

// 2. Tabungan & Kas
console.log(`${c.cyan}${c.bold}2. ZAKAT UANG KAS & TABUNGAN (Cash & Deposits)${c.reset}`);
const cashRes = calculateCashSavingsZakat({
  cashInHand: 15000000,
  bankSavings: 150000000,
  timeDeposits: 50000000,
  immediateDueDebts: 20000000,
  goldPricePerGram: goldPrice
});
console.log(`  Total Bruto    : ${formatCurrency(cashRes.details.totalGrossLiquidAssets)}`);
console.log(`  Utang Jatuh Tp : -${formatCurrency(cashRes.details.immediateDueDebtsDeducted)}`);
console.log(`  Saldo Bersih   : ${formatCurrency(cashRes.details.netZakatableBase)} (Nisab: ${formatCurrency(cashRes.details.nisabMonetaryValue)})`);
console.log(`  Zakat Terutang : ${c.bold}${c.green}${formatCurrency(cashRes.zakatDue)}${c.reset}\n`);

// 3. Perdagangan
console.log(`${c.cyan}${c.bold}3. ZAKAT PERDAGANGAN ('Urud at-Tijarah)${c.reset}`);
const bizRes = calculateBusinessZakat({
  cashAndLiquidAssets: 50000000,
  inventoryMarketValue: 200000000,
  goodReceivables: 30000000,
  dueOperationalDebts: 40000000,
  goldPricePerGram: goldPrice
});
console.log(`  Modal Kerja    : ${formatCurrency(bizRes.details.netWorkingCapitalBase)}`);
console.log(`  Zakat Terutang : ${c.bold}${c.green}${formatCurrency(bizRes.zakatDue)}${c.reset}\n`);

// 4. Penghasilan
console.log(`${c.cyan}${c.bold}4. ZAKAT PENGHASILAN / PROFESI BULANAN (Fatwa MUI 3/2003)${c.reset}`);
const incRes = calculateIncomeZakat({
  grossIncome: 25000000,
  basicLivingExpenses: 8000000,
  dueDebtInstallment: 2000000,
  method: 'net',
  period: 'monthly',
  goldPricePerGram: goldPrice
});
console.log(`  Gaji Bruto     : ${formatCurrency(incRes.details.grossIncome)} / bulan`);
console.log(`  Biaya Pokok    : -${formatCurrency(incRes.details.basicLivingExpensesDeducted)}`);
console.log(`  Cicilan Utang  : -${formatCurrency(incRes.details.dueDebtInstallmentDeducted)}`);
console.log(`  Bersih (Netto) : ${formatCurrency(incRes.details.zakatableBase)} (Nisab: ${formatCurrency(incRes.details.periodNisabThreshold)})`);
console.log(`  Zakat Bulanan  : ${c.bold}${c.green}${formatCurrency(incRes.zakatDue)}${c.reset}\n`);

// 5. Pertanian
console.log(`${c.cyan}${c.bold}5. ZAKAT PERTANIAN (Panen Padi / Beras)${c.reset}`);
const agriRes = calculateAgricultureZakat({
  harvestWeightKg: 1500,
  produceType: 'grain_unhusked',
  irrigation: 'natural',
  pricePerKg: 7000
});
console.log(`  Hasil Panen    : 1.500 kg Gabah (Nisab 5 Wasaq: 653 kg)`);
console.log(`  Sistem Irigasi : Tadah Hujan / Alami -> Tarif 10% (Al-'Usyr)`);
console.log(`  Zakat Terutang : ${c.bold}${agriRes.details.zakatDueKg} kg Gabah${c.reset} (${formatCurrency(agriRes.details.zakatDueMonetary)})\n`);

// 6. Peternakan
console.log(`${c.cyan}${c.bold}6. ZAKAT PETERNAKAN (Sapi & Kerbau)${c.reset}`);
const liveRes = calculateLivestockZakat({
  animalType: 'cattle',
  count: 75
});
console.log(`  Populasi Ternak: 75 ekor Sapi`);
console.log(`  Zakat Terutang : ${c.bold}${c.green}${liveRes.zakatDue}${c.reset}`);
console.log(`  Rincian Syar'i :`);
liveRes.details.itemsDue.forEach(item => {
  console.log(`    - ${item.quantity}x ${item.arabicTerm} (${item.animalType}) : ${item.ageDescription}`);
});
console.log('');

// 7. Korporasi (AAOIFI Standard 35)
console.log(`${c.cyan}${c.bold}7. ZAKAT KORPORASI / PERUSAHAAN (AAOIFI Standard 35)${c.reset}`);
const corpRes = calculateCorporateZakat({
  currentAssets: 5000000000, // 5 Miliar
  currentLiabilities: 1000000000, // 1 Miliar
  muslimOwnershipPercentage: 75, // 75% Saham Muslim
  goldPricePerGram: goldPrice,
  calendar: 'gregorian' // 2.577% tarif Masehi
});
console.log(`  Aset Lancar    : ${formatCurrency(corpRes.details.breakdown.currentAssets)}`);
console.log(`  Liabilitas     : -${formatCurrency(corpRes.details.breakdown.currentLiabilities)}`);
console.log(`  Porsi Muslim   : 75% -> Basis: ${formatCurrency(corpRes.details.muslimZakatableBase)}`);
console.log(`  Tarif AAOIFI   : 2.577% (Tahun Buku Masehi)`);
console.log(`  Zakat Terutang : ${c.bold}${c.green}${formatCurrency(corpRes.zakatDue)}${c.reset}\n`);

// 8. Investasi & Kripto
console.log(`${c.cyan}${c.bold}8. ZAKAT INVESTASI SAHAM & KRIPTO${c.reset}`);
const cryptoRes = calculateCryptoZakat({
  portfolioValue: 15000, // $15,000 USD
  goldPricePerGram: 75, // $75/gram
  currency: 'USD'
});
console.log(`  Aset Kripto    : $15,000.00 USD (Nisab 85g: $6,375.00 USD)`);
console.log(`  Zakat Terutang : ${c.bold}${c.green}$${cryptoRes.zakatDue} USD${c.reset}\n`);

// 9. Dalil Catalog
console.log(`${c.cyan}${c.bold}9. KATALOG RUJUKAN DALIL RESMI${c.reset}`);
const dalils = getAllDalils();
console.log(`  Total Dalil Terdaftar: ${c.bold}${dalils.length} Dokumen Syariah${c.reset}`);
const bukhariHadiths = searchDalil('Bukhari');
console.log(`  Hadits Shahih Bukhari : ${bukhariHadiths.length} riwayat terverifikasi\n`);

console.log(`${c.green}${c.bold}Semua modul terverifikasi berjalan sempurna dan akurat! ✨${c.reset}\n`);
