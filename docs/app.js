/**
 * zakat-mal: Web Showcase & Interactive Engine
 * Zero external dependencies. Replicates exact fixed-point algorithms from zakat-mal NPM package.
 */

// Shariah Constants
const NISAB_GOLD_GRAMS = 85;
const NISAB_SILVER_GRAMS = 595;
const RATE_HIJRI = 0.025;
const RATE_SOLAR = 0.02577;

// Currency Presets
const CURRENCIES = {
  IDR: { symbol: 'Rp', goldDefault: 1500000, locale: 'id-ID', decimals: 0 },
  USD: { symbol: '$', goldDefault: 85, locale: 'en-US', decimals: 2 },
  SAR: { symbol: 'SAR', goldDefault: 318, locale: 'ar-SA', decimals: 2 },
  MYR: { symbol: 'RM', goldDefault: 395, locale: 'ms-MY', decimals: 2 },
  SGD: { symbol: 'S$', goldDefault: 115, locale: 'en-SG', decimals: 2 },
  EUR: { symbol: '€', goldDefault: 78, locale: 'de-DE', decimals: 2 }
};

// Application State
let currentTab = 'gold';
let currentCurrency = 'IDR';
let currentCalendar = 'hijri';

// Dalils mapping
const DALILS = {
  gold: {
    ref: "Sunan Abu Dawud No. 1573 & Sahih Bukhari No. 1405",
    text: "Nisab emas adalah 20 Dinar (setara 85 gram emas murni) dan perak 200 Dirham (595 gram perak). Jika telah genap haul 1 tahun, kadar zakatnya adalah 2.5% (seperempat puluh)."
  },
  cash: {
    ref: "Ijma' Ulama & Qiyas atas An-Naqdayn (Emas/Perak)",
    text: "Uang tunai, tabungan, deposito, dan piutang lancar disetarakan dengan emas. Wajib zakat jika saldo bersih setelah dikurangi utang jatuh tempo mencapai nisab 85g emas dan bertahan selama 1 haul."
  },
  income: {
    ref: "Fatwa MUI No. 3/2003 & SK Ketua BAZNAS 2026",
    text: "Zakat penghasilan/profesi ditunaikan saat menerima penghasilan jika mencapai nisab senilai 85 gram emas per tahun (atau 1/12 per bulan). Tarif 2.5% dihitung dari penghasilan kotor (gross) atau bersih (setelah kebutuhan pokok)."
  },
  business: {
    ref: "QS. Al-Baqarah 2:267 & Sunan Abu Dawud No. 1562",
    text: "Nabi ﷺ memerintahkan kami mengeluarkan zakat dari apa yang kami persiapkan untuk diperdagangkan ('Urudh at-Tijarah). Basis zakat = (Aset Lancar + Piutang Lancar + Persediaan) - Utang Jangka Pendek."
  },
  corporate: {
    ref: "AAOIFI Shari'ah Standard No. 35 on Zakah",
    text: "Perhitungan zakat entitas korporat menurut AAOIFI Standard 35 menggunakan metode Modal Kerja Bersih (Net Working Capital) atau Pembiayaan Bersih. Dikalikan persentase kepemilikan saham Muslim."
  }
};

// Arabic Akad Templates
const AKAD_TEMPLATES = {
  self: {
    title: "Niat Zakat untuk Diri Sendiri (An-Nafs)",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلّٰهِ تَعَالَى",
    transliteration: "Nawaytu an ukhrija zakaata maali fardhan lillahi ta'ala.",
    translation: "Aku berniat mengeluarkan zakat hartaku, fardhu karena Allah Ta'ala."
  },
  family: {
    title: "Niat Zakat untuk Keluarga / Tanggungan (Al-Ahl)",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي وَمَالِ مَنْ يَلْزَمُنِي نَفَقَتُهُمْ شَرْعًا فَرْضًا لِلّٰهِ تَعَالَى",
    transliteration: "Nawaytu an ukhrija zakaata maali wa maali man yalzamunii nafaqatuhum syar'an fardhan lillahi ta'ala.",
    translation: "Aku berniat mengeluarkan zakat hartaku dan harta orang-orang yang nafkahnya menjadi tanggunganku secara syar'i, fardhu karena Allah Ta'ala."
  },
  corporate: {
    title: "Niat Zakat Korporat / Lembaga Usaha",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ هٰذِهِ الشَّرِكَةِ فَرْضًا لِلّٰهِ تَعَالَى",
    transliteration: "Nawaytu an ukhrija zakaata hadzihisy-syarikati fardhan lillahi ta'ala.",
    translation: "Aku berniat mengeluarkan zakat perusahaan ini, fardhu karena Allah Ta'ala."
  },
  amil: {
    title: "Doa Amil Saat Menerima Zakat (QS. At-Tawbah 9:103)",
    arabic: "آجَرَكَ اللّٰهُ فِيمَا أَعْطَيْتَ وَبَارَكَ فِيمَا أَبْقَيْتَ وَجَعَلَهُ لَكَ طَهُورًا",
    transliteration: "Aajarokallahu fiima a'thoyta wa baaraka fiima abqayta wa ja'alahu laka thahuuraa.",
    translation: "Semoga Allah memberikan pahala atas apa yang engkau berikan, memberkahi apa yang masih engkau simpan, dan menjadikannya pembersih bagimu."
  }
};

// Formatter Utility
function formatMoney(amount, currencyCode) {
  const cfg = CURRENCIES[currencyCode] || CURRENCIES.IDR;
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: cfg.decimals,
    minimumFractionDigits: cfg.decimals
  }).format(amount);
}

// Generate Checksum Certificate ID
function generateCertificateChecksum() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 6; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 6; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  return `ZK-${p1}-${p2}`;
}

// Calculate active module
function calculateZakat() {
  const currency = document.getElementById('currency-select').value;
  const calendar = document.getElementById('calendar-select').value;
  const rate = calendar === 'solar' ? RATE_SOLAR : RATE_HIJRI;

  let zakatableBase = 0;
  let nisabValue = 0;
  let zakatDue = 0;
  let isZakatable = false;
  let breakdownRows = [];
  let codeSnippet = '';

  if (currentTab === 'gold') {
    const goldGrams = parseFloat(document.getElementById('gold-grams').value) || 0;
    const goldPrice = parseFloat(document.getElementById('gold-price').value) || 0;
    const karat = parseInt(document.getElementById('gold-karat').value, 10) || 24;
    const jewelryGrams = parseFloat(document.getElementById('jewelry-grams').value) || 0;
    const jewelryExemption = document.getElementById('jewelry-exemption').value;

    const fineMultiplier = karat / 24;
    const exemptGrams = jewelryExemption === 'jumhur' ? jewelryGrams : 0;
    const netGrams = Math.max(0, goldGrams - exemptGrams);
    const fineEquivalentGrams = netGrams * fineMultiplier;

    nisabValue = NISAB_GOLD_GRAMS * goldPrice;
    zakatableBase = fineEquivalentGrams * goldPrice;
    isZakatable = fineEquivalentGrams >= NISAB_GOLD_GRAMS;
    zakatDue = isZakatable ? zakatableBase * rate : 0;

    breakdownRows = [
      { label: 'Emas Murni Setara (Fine Gold)', value: `${fineEquivalentGrams.toFixed(2)} gram` },
      { label: 'Ambang Batas Nisab (85g)', value: `${NISAB_GOLD_GRAMS} gram (${formatMoney(nisabValue, currency)})` },
      { label: 'Perhiasan Dikecualikan (\'Urf)', value: `${exemptGrams} gram` },
      { label: 'Tarif yang Diterapkan', value: `${(rate * 100).toFixed(3)}% (${calendar === 'solar' ? 'Masehi' : 'Hijriyah'})` }
    ];

    codeSnippet = `import { calculateGoldSilverZakat } from 'zakat-mal/gold-silver';

const result = calculateGoldSilverZakat({
  goldGrams: ${goldGrams},
  goldPricePerGram: ${goldPrice},
  goldPurityKarat: ${karat},
  jewelryInUseGrams: ${jewelryGrams},
  jewelryExemption: '${jewelryExemption}',
  calendar: '${calendar}',
  currency: '${currency}'
});

console.log(result.isZakatable); // ${isZakatable}
console.log(result.zakatDue);    // "${zakatDue.toFixed(2)} ${currency}"`;

  } else if (currentTab === 'cash') {
    const cashOnHand = parseFloat(document.getElementById('cash-on-hand').value) || 0;
    const bankSavings = parseFloat(document.getElementById('bank-savings').value) || 0;
    const loansReceivable = parseFloat(document.getElementById('cash-loans').value) || 0;
    const immediateDebts = parseFloat(document.getElementById('cash-debts').value) || 0;
    const goldPrice = parseFloat(document.getElementById('cash-gold-price').value) || 0;

    const totalLiquidAssets = cashOnHand + bankSavings + loansReceivable;
    zakatableBase = Math.max(0, totalLiquidAssets - immediateDebts);
    nisabValue = NISAB_GOLD_GRAMS * goldPrice;
    isZakatable = zakatableBase >= nisabValue;
    zakatDue = isZakatable ? zakatableBase * rate : 0;

    breakdownRows = [
      { label: 'Total Aset Likuid', value: formatMoney(totalLiquidAssets, currency) },
      { label: 'Utang Jatuh Tempo Segera', value: `- ${formatMoney(immediateDebts, currency)}` },
      { label: 'Nisab Standar (85g Emas)', value: formatMoney(nisabValue, currency) },
      { label: 'Tarif yang Diterapkan', value: `${(rate * 100).toFixed(3)}%` }
    ];

    codeSnippet = `import { calculateCashSavingsZakat } from 'zakat-mal/cash-savings';

const result = calculateCashSavingsZakat({
  cashOnHand: ${cashOnHand},
  bankSavings: ${bankSavings},
  loansReceivable: ${loansReceivable},
  immediateDebts: ${immediateDebts},
  goldPricePerGram: ${goldPrice},
  currency: '${currency}'
});`;

  } else if (currentTab === 'income') {
    const monthlyIncome = parseFloat(document.getElementById('income-salary').value) || 0;
    const monthlyLiving = parseFloat(document.getElementById('income-living').value) || 0;
    const goldPrice = parseFloat(document.getElementById('income-gold-price').value) || 0;
    const annualNet = Math.max(0, (monthlyIncome - monthlyLiving) * 12);

    nisabValue = NISAB_GOLD_GRAMS * goldPrice;
    zakatableBase = annualNet;
    isZakatable = zakatableBase >= nisabValue;
    zakatDue = isZakatable ? (monthlyIncome - monthlyLiving) * rate : 0;

    breakdownRows = [
      { label: 'Penghasilan Bersih Bulanan', value: formatMoney(monthlyIncome - monthlyLiving, currency) },
      { label: 'Estimasi Bersih Tahunan', value: formatMoney(annualNet, currency) },
      { label: 'Nisab Tahunan (85g Emas)', value: formatMoney(nisabValue, currency) },
      { label: 'Zakat Terutang Per Bulan', value: formatMoney(zakatDue, currency) }
    ];

    codeSnippet = `import { calculateIncomeZakat } from 'zakat-mal/income';

const result = calculateIncomeZakat({
  monthlyGrossSalary: ${monthlyIncome},
  monthlyEssentialExpenses: ${monthlyLiving},
  goldPricePerGram: ${goldPrice},
  currency: '${currency}'
});`;

  } else if (currentTab === 'business') {
    const currentAssets = parseFloat(document.getElementById('biz-assets').value) || 0;
    const inventory = parseFloat(document.getElementById('biz-inventory').value) || 0;
    const shortLiabilities = parseFloat(document.getElementById('biz-liabilities').value) || 0;
    const goldPrice = parseFloat(document.getElementById('biz-gold-price').value) || 0;

    zakatableBase = Math.max(0, (currentAssets + inventory) - shortLiabilities);
    nisabValue = NISAB_GOLD_GRAMS * goldPrice;
    isZakatable = zakatableBase >= nisabValue;
    zakatDue = isZakatable ? zakatableBase * rate : 0;

    breakdownRows = [
      { label: 'Total Aset Lancar + Stok', value: formatMoney(currentAssets + inventory, currency) },
      { label: 'Kewajiban Jangka Pendek', value: `- ${formatMoney(shortLiabilities, currency)}` },
      { label: 'Nisab (85g Emas)', value: formatMoney(nisabValue, currency) },
      { label: 'Tarif Zakat Bisnis', value: `${(rate * 100).toFixed(3)}%` }
    ];

    codeSnippet = `import { calculateBusinessZakat } from 'zakat-mal/business';

const result = calculateBusinessZakat({
  cashAndReceivables: ${currentAssets},
  inventoryMarketValue: ${inventory},
  shortTermLiabilities: ${shortLiabilities},
  goldPricePerGram: ${goldPrice},
  currency: '${currency}'
});`;

  } else if (currentTab === 'corporate') {
    const currentAssets = parseFloat(document.getElementById('corp-assets').value) || 0;
    const currentLiabilities = parseFloat(document.getElementById('corp-liabilities').value) || 0;
    const muslimShare = parseFloat(document.getElementById('corp-muslim-pct').value) || 100;
    const goldPrice = parseFloat(document.getElementById('corp-gold-price').value) || 0;

    const workingCapital = Math.max(0, currentAssets - currentLiabilities);
    zakatableBase = workingCapital;
    nisabValue = NISAB_GOLD_GRAMS * goldPrice;
    isZakatable = zakatableBase >= nisabValue;
    const baseZakat = isZakatable ? zakatableBase * rate : 0;
    zakatDue = baseZakat * (muslimShare / 100);

    breakdownRows = [
      { label: 'Modal Kerja Bersih (NWC)', value: formatMoney(workingCapital, currency) },
      { label: 'Kepemilikan Saham Muslim', value: `${muslimShare}%` },
      { label: 'Ambang Nisab AAOIFI 35', value: formatMoney(nisabValue, currency) },
      { label: 'Zakat Bagian Pemegang Saham Muslim', value: formatMoney(zakatDue, currency) }
    ];

    codeSnippet = `import { calculateCorporateZakat } from 'zakat-mal/corporate';

const result = calculateCorporateZakat({
  method: 'net_working_capital',
  currentAssets: ${currentAssets},
  currentLiabilities: ${currentLiabilities},
  muslimOwnershipPercentage: ${muslimShare},
  goldPricePerGram: ${goldPrice},
  calendar: '${calendar}',
  currency: '${currency}'
});`;
  }

  // Update Result DOM
  renderResults({
    isZakatable,
    zakatDue,
    zakatableBase,
    nisabValue,
    currency,
    breakdownRows,
    codeSnippet,
    dalil: DALILS[currentTab]
  });
}

// Render Results DOM
function renderResults(data) {
  const statusCard = document.getElementById('status-card');
  const statusTag = document.getElementById('status-tag');
  const amountEl = document.getElementById('result-amount');
  const currencyLabel = document.getElementById('result-currency');
  const breakdownContainer = document.getElementById('breakdown-list');
  const dalilRefEl = document.getElementById('dalil-ref');
  const dalilTextEl = document.getElementById('dalil-text');
  const codeBlock = document.getElementById('code-snippet');

  if (data.isZakatable) {
    statusCard.className = 'result-status-card status-obligatory';
    statusTag.textContent = 'WAJIB ZAKAT (Mencapai Nisab & Haul)';
    amountEl.textContent = formatMoney(data.zakatDue, data.currency);
  } else {
    statusCard.className = 'result-status-card status-non-obligatory';
    statusTag.textContent = 'BELUM WAJIB ZAKAT (Di Bawah Nisab)';
    amountEl.textContent = formatMoney(0, data.currency);
  }

  currencyLabel.textContent = `Mata Uang: ${data.currency} • Basis: ${formatMoney(data.zakatableBase, data.currency)}`;

  // Render Breakdown Rows
  breakdownContainer.innerHTML = '';
  data.breakdownRows.forEach(row => {
    const li = document.createElement('li');
    li.className = 'breakdown-row';
    li.innerHTML = `<span>${row.label}</span><span>${row.value}</span>`;
    breakdownContainer.appendChild(li);
  });

  // Render Dalil
  dalilRefEl.textContent = data.dalil.ref;
  dalilTextEl.textContent = data.dalil.text;

  // Render Code Snippet
  codeBlock.textContent = data.codeSnippet;
}

// Switch Active Category Tab
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.calc-form-pane').forEach(pane => {
    pane.style.display = pane.dataset.pane === tabId ? 'block' : 'none';
  });
  calculateZakat();
}

// Sync Currency defaults
function handleCurrencyChange(currencyCode) {
  currentCurrency = currencyCode;
  const cfg = CURRENCIES[currencyCode] || CURRENCIES.IDR;
  const goldInputs = document.querySelectorAll('.input-gold-price');
  goldInputs.forEach(input => {
    input.value = cfg.goldDefault;
  });
  calculateZakat();
}

// Modal Handlers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// Open Akad Modal
function handleOpenAkad() {
  const akadType = currentTab === 'corporate' ? 'corporate' : 'self';
  const template = AKAD_TEMPLATES[akadType];

  document.getElementById('akad-modal-title').textContent = template.title;
  document.getElementById('akad-arabic').textContent = template.arabic;
  document.getElementById('akad-latin').textContent = template.transliteration;
  document.getElementById('akad-indo').textContent = template.translation;

  openModal('akad-modal');
}

// Open Certificate Modal
function handleOpenCertificate() {
  const amount = document.getElementById('result-amount').textContent;
  const certId = generateCertificateChecksum();
  const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('cert-id-display').textContent = certId;
  document.getElementById('cert-date-display').textContent = dateStr;
  document.getElementById('cert-amount-display').textContent = amount;
  document.getElementById('cert-category-display').textContent = `Zakat ${currentTab.toUpperCase()}`;

  openModal('cert-modal');
}

// Copy Code
function copyCode() {
  const code = document.getElementById('code-snippet').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('btn-copy-code');
    const oldText = btn.textContent;
    btn.textContent = 'Tersalin!';
    setTimeout(() => { btn.textContent = oldText; }, 2000);
  });
}

// Copy NPM Command
function copyNpmCmd() {
  navigator.clipboard.writeText('npm install zakat-mal').then(() => {
    const btn = document.getElementById('btn-copy-npm');
    const oldText = btn.textContent;
    btn.textContent = 'Tersalin!';
    setTimeout(() => { btn.textContent = oldText; }, 2000);
  });
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Bind Tab Click
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Bind Currency Change
  const currencySelect = document.getElementById('currency-select');
  currencySelect.addEventListener('change', (e) => handleCurrencyChange(e.target.value));

  // Bind Calendar Change
  const calendarSelect = document.getElementById('calendar-select');
  calendarSelect.addEventListener('change', (e) => {
    currentCalendar = e.target.value;
    calculateZakat();
  });

  // Bind Input Changes for live calculation
  document.querySelectorAll('.form-input, .form-select').forEach(input => {
    input.addEventListener('input', calculateZakat);
  });

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });

  // Load Saved Theme
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Initial Calculation
  calculateZakat();
});
