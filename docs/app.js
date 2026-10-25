/**
 * zakat-mal: Interactive Web Showcase & Live Calculation Engine
 * 100% Zero-Dependency Client-Side Implementation
 * Faithfully mirrors the fixed-point decimal engine of zakat-mal NPM package.
 */

// Shariah Standard Constants
const NISAB_GOLD_GRAMS = 85;
const NISAB_SILVER_GRAMS = 595;
const RATE_HIJRI_DECIMAL = 0.025;
const RATE_SOLAR_DECIMAL = 0.02577; // AAOIFI Standard 35 Section 4/1/4
const NISAB_AGRICULTURE_KG = 653;   // 5 Wasaq unhusked grain

// International Currency Registry
const CURRENCY_REGISTRY = {
  USD: { symbol: '$', goldDefault: 85, locale: 'en-US', decimals: 2 },
  EUR: { symbol: '€', goldDefault: 78, locale: 'de-DE', decimals: 2 },
  GBP: { symbol: '£', goldDefault: 68, locale: 'en-GB', decimals: 2 },
  SAR: { symbol: 'SAR', goldDefault: 318, locale: 'ar-SA', decimals: 2 },
  AED: { symbol: 'AED', goldDefault: 312, locale: 'ar-AE', decimals: 2 },
  MYR: { symbol: 'RM', goldDefault: 395, locale: 'ms-MY', decimals: 2 },
  SGD: { symbol: 'S$', goldDefault: 115, locale: 'en-SG', decimals: 2 },
  IDR: { symbol: 'Rp', goldDefault: 1500000, locale: 'id-ID', decimals: 0 }
};

// Shariah Dalil Database
const SHARIAH_DALILS = {
  gold: {
    source: "Sunan Abu Dawud No. 1573 & Sahih Bukhari No. 1405",
    quote: '"When you possess twenty dinars (85g pure gold) and a year passes over it, half a dinar (2.5%) is due. And on two hundred dirhams of silver (595g), five dirhams are due."'
  },
  cash: {
    source: "QS. At-Tawbah (9:34) & Classical Ijma' on An-Naqdayn",
    quote: '"Cash monies, deposits, and liquid bank assets are evaluated against the gold standard (85g). Immediate short-term debts are deducted, and 2.5% is payable after 1 Hawl."'
  },
  income: {
    source: "Majma' al-Fiqh al-Islami & Yusuf Al-Qaradawi (Fiqh az-Zakat)",
    quote: '"Zakat is due upon receipt of lawful earned income whenever it reaches the monthly nisab threshold (85g gold / 12) after deducting basic living needs."'
  },
  business: {
    source: "Sunan Abu Dawud No. 1562 & QS. Al-Baqarah (2:267)",
    quote: '"The Messenger of Allah (ﷺ) commanded us to pay zakat from whatever we prepared for sale. Net working base = Liquid Assets + Inventory at Market Value - Due Debts."'
  },
  corporate: {
    source: "AAOIFI Shari'ah Standard No. 35 on Zakah (§4/1/4 & §4/2)",
    quote: '"Corporate zakat is calculated via the Net Working Capital approach. If using a 365-day solar fiscal year, the due rate is adjusted from 2.500% to 2.577%."'
  },
  crypto: {
    source: "Contemporary Shariah Boards & AAOIFI Standard No. 35",
    quote: '"Digital crypto assets are classified as monetary trade merchandise (\'Urud at-Tijarah). Evaluated at fair market value and subject to 2.5% upon reaching 85g gold nisab."'
  },
  agriculture: {
    source: "Sahih Bukhari No. 1483 & QS. Al-An'am (6:141)",
    quote: '"On land irrigated by rain water or natural springs, one-tenth (10%) is due; on land irrigated by drawn water/pumps, half-of-one-tenth (5%) is due upon harvest day."'
  },
  livestock: {
    source: "Sahih Bukhari No. 1454 (Kitab Shadaqah of Abu Bakr)",
    quote: '"Comprehensive brackets for free-grazing animals (Sa\'imah): Camels (nisab 5), Sheep (nisab 40), Cattle (nisab 30: 1 Tabi\' per 30 and 1 Musinnah per 40)."'
  }
};

// Shariah Niyyah (Akad) Prayers
const NIYYAH_TEMPLATES = {
  gold: {
    title: "Niyyah for Gold, Silver & Wealth",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلّٰهِ تَعَالَى",
    translit: "Nawaytu an ukhrija zakaata maali fardhan lillahi ta'ala.",
    english: '"I intend to disburse the obligatory Zakat upon my wealth, as a sacred duty for the sake of Allah the Almighty."'
  },
  cash: {
    title: "Niyyah for Cash & Bank Savings",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلّٰهِ تَعَالَى",
    translit: "Nawaytu an ukhrija zakaata maali fardhan lillahi ta'ala.",
    english: '"I intend to disburse the obligatory Zakat upon my savings and monetary funds, as a sacred duty for the sake of Allah the Almighty."'
  },
  income: {
    title: "Niyyah for Earned Professional Income",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ كَسْبِي فَرْضًا لِلّٰهِ تَعَالَى",
    translit: "Nawaytu an ukhrija zakaata kasbii fardhan lillahi ta'ala.",
    english: '"I intend to disburse the obligatory Zakat upon my earnings and professional income, as a sacred duty for the sake of Allah the Almighty."'
  },
  business: {
    title: "Niyyah for Commercial Trade Inventory",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ تِجَارَتِي فَرْضًا لِلّٰهِ تَعَالَى",
    translit: "Nawaytu an ukhrija zakaata tijaaratii fardhan lillahi ta'ala.",
    english: '"I intend to disburse the obligatory Zakat upon my business merchandise and trade assets, for the sake of Allah the Almighty."'
  },
  corporate: {
    title: "Niyyah for Corporate Entity / Enterprise",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ هٰذِهِ الشَّرِكَةِ فَرْضًا لِلّٰهِ تَعَالَى",
    translit: "Nawaytu an ukhrija zakaata hadzihisy-syarikati fardhan lillahi ta'ala.",
    english: '"I intend to disburse the obligatory Zakat upon the zakatable equity of this enterprise, for the sake of Allah the Almighty."'
  },
  crypto: {
    title: "Niyyah for Digital Crypto Assets",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلّٰهِ تَعَالَى",
    translit: "Nawaytu an ukhrija zakaata maali fardhan lillahi ta'ala.",
    english: '"I intend to disburse the obligatory Zakat upon my digital cryptocurrency assets, as a sacred duty for the sake of Allah."'
  },
  agriculture: {
    title: "Niyyah for Harvested Produce",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ زَرْعِي فَرْضًا لِلّٰهِ تَعَالَى",
    translit: "Nawaytu an ukhrija zakaata zar'ii fardhan lillahi ta'ala.",
    english: '"I intend to disburse the obligatory Zakat upon this agricultural crop on the day of its harvest, for the sake of Allah the Almighty."'
  },
  livestock: {
    title: "Niyyah for Livestock Animals",
    arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ أَنْعَامِي فَرْضًا لِلّٰهِ تَعَالَى",
    translit: "Nawaytu an ukhrija zakaata an'aamii fardhan lillahi ta'ala.",
    english: '"I intend to disburse the obligatory Zakat upon my livestock herd, for the sake of Allah the Almighty."'
  }
};

// Application State
let activeTab = 'gold';
let activeCurrency = 'USD';
let activeCalendar = 'hijri';
let lastCalculatedResult = null;

// Currency Formatter
function formatMoney(amount, currencyCode) {
  const reg = CURRENCY_REGISTRY[currencyCode] || CURRENCY_REGISTRY.USD;
  return new Intl.NumberFormat(reg.locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: reg.decimals,
    minimumFractionDigits: reg.decimals
  }).format(amount);
}

// Checksum Generator
function generateCertificateChecksum() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  return `ZK-${new Date().getFullYear()}-${p1}${p2}`;
}

// Preset Setter for Gold
function setGoldPreset(grams) {
  const input = document.getElementById('gold-grams');
  if (input) {
    input.value = grams;
    recalculateActiveModule();
  }
}

// Recalculate Active Module
function recalculateActiveModule() {
  const currencyCfg = CURRENCY_REGISTRY[activeCurrency] || CURRENCY_REGISTRY.USD;
  const rate = activeCalendar === 'solar' ? RATE_SOLAR_DECIMAL : RATE_HIJRI_DECIMAL;
  const rateLabel = activeCalendar === 'solar' ? '2.577% (AAOIFI Solar Fiscal)' : '2.500% (Hijri Lunar)';

  let isObligatory = false;
  let zakatableBase = 0;
  let nisabThreshold = 0;
  let zakatDue = 0;
  let baseFormatted = '';
  let nisabFormatted = '';
  let dueFormatted = '';
  let hawlFulfilled = true;
  let customDetails = {};

  switch (activeTab) {
    case 'gold': {
      const rawGrams = parseFloat(document.getElementById('gold-grams')?.value || '0') || 0;
      const karat = parseInt(document.getElementById('gold-karat')?.value || '24', 10);
      const pricePerGram = parseFloat(document.getElementById('gold-price')?.value || `${currencyCfg.goldDefault}`) || 0;
      const jewelryGrams = parseFloat(document.getElementById('jewelry-grams')?.value || '0') || 0;
      const exemption = document.getElementById('jewelry-exemption')?.value || 'jumhur';

      const purityRatio = karat / 24;
      let effectiveGrams = rawGrams * purityRatio;

      if (exemption === 'jumhur') {
        const exemptGrams = jewelryGrams * purityRatio;
        effectiveGrams = Math.max(0, effectiveGrams - exemptGrams);
      }

      nisabThreshold = NISAB_GOLD_GRAMS;
      isObligatory = effectiveGrams >= nisabThreshold;
      zakatableBase = effectiveGrams;
      zakatDue = isObligatory ? (effectiveGrams * rate * pricePerGram) : 0;

      baseFormatted = `${effectiveGrams.toFixed(2)}g pure gold (${formatMoney(effectiveGrams * pricePerGram, activeCurrency)})`;
      nisabFormatted = `85g pure gold (${formatMoney(NISAB_GOLD_GRAMS * pricePerGram, activeCurrency)})`;
      dueFormatted = formatMoney(zakatDue, activeCurrency);
      break;
    }

    case 'cash': {
      const cash = parseFloat(document.getElementById('cash-on-hand')?.value || '0') || 0;
      const savings = parseFloat(document.getElementById('bank-savings')?.value || '0') || 0;
      const loans = parseFloat(document.getElementById('cash-loans')?.value || '0') || 0;
      const debts = parseFloat(document.getElementById('cash-debts')?.value || '0') || 0;
      const goldPrice = parseFloat(document.getElementById('cash-gold-price')?.value || `${currencyCfg.goldDefault}`) || 0;

      const totalLiquid = cash + savings + loans;
      const netBase = Math.max(0, totalLiquid - debts);
      const nisabVal = NISAB_GOLD_GRAMS * goldPrice;

      isObligatory = netBase >= nisabVal;
      zakatableBase = netBase;
      nisabThreshold = nisabVal;
      zakatDue = isObligatory ? (netBase * rate) : 0;

      baseFormatted = formatMoney(netBase, activeCurrency);
      nisabFormatted = `${formatMoney(nisabVal, activeCurrency)} (85g Gold)`;
      dueFormatted = formatMoney(zakatDue, activeCurrency);
      break;
    }

    case 'income': {
      const gross = parseFloat(document.getElementById('income-salary')?.value || '0') || 0;
      const living = parseFloat(document.getElementById('income-living')?.value || '0') || 0;
      const debts = parseFloat(document.getElementById('income-debts')?.value || '0') || 0;
      const goldPrice = parseFloat(document.getElementById('income-gold-price')?.value || `${currencyCfg.goldDefault}`) || 0;

      const netIncome = Math.max(0, gross - living - debts);
      const monthlyNisab = (NISAB_GOLD_GRAMS * goldPrice) / 12;

      isObligatory = netIncome >= monthlyNisab;
      zakatableBase = netIncome;
      nisabThreshold = monthlyNisab;
      zakatDue = isObligatory ? (netIncome * 0.025) : 0;

      baseFormatted = `${formatMoney(netIncome, activeCurrency)} (Monthly Net)`;
      nisabFormatted = `${formatMoney(monthlyNisab, activeCurrency)} (1/12 of 85g Gold)`;
      dueFormatted = formatMoney(zakatDue, activeCurrency);
      hawlFulfilled = false; // Income zakat paid upon receipt
      break;
    }

    case 'business': {
      const cashReceivables = parseFloat(document.getElementById('biz-cash')?.value || '0') || 0;
      const inventory = parseFloat(document.getElementById('biz-inventory')?.value || '0') || 0;
      const liabilities = parseFloat(document.getElementById('biz-liabilities')?.value || '0') || 0;
      const goldPrice = parseFloat(document.getElementById('biz-gold-price')?.value || `${currencyCfg.goldDefault}`) || 0;

      const netBase = Math.max(0, (cashReceivables + inventory) - liabilities);
      const nisabVal = NISAB_GOLD_GRAMS * goldPrice;

      isObligatory = netBase >= nisabVal;
      zakatableBase = netBase;
      nisabThreshold = nisabVal;
      zakatDue = isObligatory ? (netBase * rate) : 0;

      baseFormatted = formatMoney(netBase, activeCurrency);
      nisabFormatted = `${formatMoney(nisabVal, activeCurrency)} (85g Gold)`;
      dueFormatted = formatMoney(zakatDue, activeCurrency);
      break;
    }

    case 'corporate': {
      const currentAssets = parseFloat(document.getElementById('corp-assets')?.value || '0') || 0;
      const currentLiabilities = parseFloat(document.getElementById('corp-liabilities')?.value || '0') || 0;
      const muslimPct = Math.max(0, Math.min(100, parseFloat(document.getElementById('corp-muslim-pct')?.value || '100') || 100));
      const goldPrice = parseFloat(document.getElementById('corp-gold-price')?.value || `${currencyCfg.goldDefault}`) || 0;

      const nwc = Math.max(0, currentAssets - currentLiabilities);
      const muslimBase = nwc * (muslimPct / 100);
      const nisabVal = NISAB_GOLD_GRAMS * goldPrice;

      isObligatory = muslimBase >= nisabVal;
      zakatableBase = muslimBase;
      nisabThreshold = nisabVal;
      zakatDue = isObligatory ? (muslimBase * rate) : 0;

      baseFormatted = `${formatMoney(muslimBase, activeCurrency)} (${muslimPct}% Muslim share of ${formatMoney(nwc, activeCurrency)})`;
      nisabFormatted = `${formatMoney(nisabVal, activeCurrency)} (85g Gold)`;
      dueFormatted = formatMoney(zakatDue, activeCurrency);
      break;
    }

    case 'crypto': {
      const portfolio = parseFloat(document.getElementById('crypto-portfolio')?.value || '0') || 0;
      const goldPrice = parseFloat(document.getElementById('crypto-gold-price')?.value || `${currencyCfg.goldDefault}`) || 0;

      const nisabVal = NISAB_GOLD_GRAMS * goldPrice;
      isObligatory = portfolio >= nisabVal;
      zakatableBase = portfolio;
      nisabThreshold = nisabVal;
      zakatDue = isObligatory ? (portfolio * rate) : 0;

      baseFormatted = formatMoney(portfolio, activeCurrency);
      nisabFormatted = `${formatMoney(nisabVal, activeCurrency)} (85g Gold)`;
      dueFormatted = formatMoney(zakatDue, activeCurrency);
      break;
    }

    case 'agriculture': {
      const weightKg = parseFloat(document.getElementById('agri-weight')?.value || '0') || 0;
      const irrigation = document.getElementById('agri-irrigation')?.value || 'natural';
      const pricePerKg = parseFloat(document.getElementById('agri-price')?.value || '1.5') || 0;

      let agriRate = 0.10;
      let agriRateLabel = '10.0% (Natural / Rain-Fed)';
      if (irrigation === 'artificial') {
        agriRate = 0.05;
        agriRateLabel = '5.0% (Artificially Irrigated)';
      } else if (irrigation === 'mixed') {
        agriRate = 0.075;
        agriRateLabel = '7.5% (Mixed Irrigation)';
      }

      isObligatory = weightKg >= NISAB_AGRICULTURE_KG;
      const zakatDueKg = isObligatory ? (weightKg * agriRate) : 0;
      const zakatDueMonetary = zakatDueKg * pricePerKg;

      zakatableBase = weightKg;
      nisabThreshold = NISAB_AGRICULTURE_KG;
      zakatDue = zakatDueMonetary;

      baseFormatted = `${weightKg.toLocaleString()} kg harvest`;
      nisabFormatted = `653 kg (5 Wasaq grain)`;
      dueFormatted = `${zakatDueKg.toFixed(1)} kg (${formatMoney(zakatDueMonetary, activeCurrency)})`;
      hawlFulfilled = false; // Due on harvest day
      break;
    }

    case 'livestock': {
      const type = document.getElementById('livestock-type')?.value || 'cattle';
      const count = parseInt(document.getElementById('livestock-count')?.value || '0', 10) || 0;

      let desc = '';
      if (type === 'cattle') {
        isObligatory = count >= 30;
        nisabFormatted = '30 head (Cattle)';
        if (isObligatory) {
          // Solve optimal 30 (tabi) and 40 (musinnah) combination
          let bestT = 0, bestM = 0, minRem = count;
          for (let m = 0; m * 40 <= count; m++) {
            const rem = count - (m * 40);
            const t = Math.floor(rem / 30);
            const left = rem % 30;
            if (left < minRem) {
              minRem = left;
              bestT = t;
              bestM = m;
            }
          }
          const parts = [];
          if (bestT > 0) parts.push(`${bestT}x Tabi' (1-yr calf)`);
          if (bestM > 0) parts.push(`${bestM}x Musinnah (2-yr cow)`);
          desc = parts.join(' + ') || '1x Tabi\'';
        } else {
          desc = '0 head (Below Nisab of 30)';
        }
      } else if (type === 'sheep') {
        isObligatory = count >= 40;
        nisabFormatted = '40 head (Sheep/Goats)';
        if (count < 40) desc = '0 (Below Nisab)';
        else if (count <= 120) desc = '1 sheep (Syah)';
        else if (count <= 200) desc = '2 sheep';
        else if (count <= 300) desc = '3 sheep';
        else desc = `${Math.floor(count / 100)} sheep`;
      } else {
        isObligatory = count >= 5;
        nisabFormatted = '5 head (Camels)';
        if (count < 5) desc = '0 (Below Nisab)';
        else if (count <= 24) desc = `${Math.floor(count / 5)} sheep (Syah)`;
        else desc = '1 female camel (Bint Makhadh / Bint Labun)';
      }

      zakatableBase = count;
      baseFormatted = `${count} head (${type})`;
      dueFormatted = desc;
      break;
    }
  }

  // Save calculation state
  lastCalculatedResult = {
    category: activeTab,
    isObligatory,
    zakatableBase,
    baseFormatted,
    nisabFormatted,
    dueFormatted,
    rateLabel,
    hawlFulfilled,
    currency: activeCurrency
  };

  // Update DOM Results
  const badge = document.getElementById('obligation-badge');
  const statusText = document.getElementById('status-text');
  if (badge && statusText) {
    if (isObligatory) {
      badge.className = 'badge-status status-obligatory';
      statusText.textContent = 'OBLIGATORY (WAJIB ZAKAT)';
    } else {
      badge.className = 'badge-status status-exempt';
      statusText.textContent = 'EXEMPT (BELOW NISAB)';
    }
  }

  const elAmount = document.getElementById('zakat-amount');
  if (elAmount) elAmount.textContent = dueFormatted;

  const elBase = document.getElementById('val-base');
  if (elBase) elBase.textContent = baseFormatted;

  const elNisab = document.getElementById('val-nisab');
  if (elNisab) elNisab.textContent = nisabFormatted;

  const elRate = document.getElementById('val-rate');
  if (elRate) elRate.textContent = rateLabel;

  const elHawl = document.getElementById('val-hawl');
  if (elHawl) elHawl.textContent = hawlFulfilled ? 'Fulfilled (1 Full Lunar Year)' : 'Exempt (Due Immediately)';

  // Update Mobile Sticky Bar
  const elMobileAmount = document.getElementById('mobile-stat-amount');
  if (elMobileAmount) elMobileAmount.textContent = dueFormatted;

  // Update Dalil Quote
  const dalil = SHARIAH_DALILS[activeTab] || SHARIAH_DALILS.gold;
  const elSource = document.getElementById('dalil-source');
  const elQuote = document.getElementById('dalil-quote');
  if (elSource) elSource.textContent = dalil.source;
  if (elQuote) elQuote.textContent = dalil.quote;

  // Update Live Code Mirror
  updateCodeMirror();
}

// Update Real-Time Code Mirror
function updateCodeMirror() {
  const codeBlock = document.getElementById('code-snippet-body');
  if (!codeBlock) return;

  let snippet = '';
  switch (activeTab) {
    case 'gold': {
      const grams = document.getElementById('gold-grams')?.value || '100';
      const karat = document.getElementById('gold-karat')?.value || '24';
      const price = document.getElementById('gold-price')?.value || '85';
      snippet = `import { calculateGoldSilverZakat } from 'zakat-mal/gold-silver';

const result = calculateGoldSilverZakat({
  goldGrams: ${grams},
  goldPurityKarat: ${karat},
  goldPricePerGram: ${price},
  calendar: '${activeCalendar}',
  currency: '${activeCurrency}',
  locale: 'en'
});

console.log(result.isObligatory); // ${lastCalculatedResult?.isObligatory}
console.log(result.zakatDue);      // "${lastCalculatedResult?.dueFormatted}"`;
      break;
    }

    case 'cash': {
      const cash = document.getElementById('cash-on-hand')?.value || '5000';
      const savings = document.getElementById('bank-savings')?.value || '25000';
      const debts = document.getElementById('cash-debts')?.value || '3000';
      const goldPrice = document.getElementById('cash-gold-price')?.value || '85';
      snippet = `import { calculateCashSavingsZakat } from 'zakat-mal/cash-savings';

const result = calculateCashSavingsZakat({
  liquidCash: ${cash},
  bankSavings: ${savings},
  immediateDueDebts: ${debts},
  goldPricePerGram: ${goldPrice},
  calendar: '${activeCalendar}',
  currency: '${activeCurrency}'
});

console.log(result.isObligatory); // ${lastCalculatedResult?.isObligatory}
console.log(result.zakatDue);      // "${lastCalculatedResult?.dueFormatted}"`;
      break;
    }

    case 'corporate': {
      const assets = document.getElementById('corp-assets')?.value || '1000000';
      const debts = document.getElementById('corp-liabilities')?.value || '200000';
      const pct = document.getElementById('corp-muslim-pct')?.value || '100';
      snippet = `import { calculateCorporateZakat } from 'zakat-mal/corporate';

// Strictly complies with AAOIFI Shari'ah Standard No. 35
const result = calculateCorporateZakat({
  currentAssets: ${assets},
  currentLiabilities: ${debts},
  muslimOwnershipPercentage: ${pct},
  calendar: '${activeCalendar}',
  currency: '${activeCurrency}'
});

console.log(result.isObligatory); // ${lastCalculatedResult?.isObligatory}
console.log(result.zakatDue);      // "${lastCalculatedResult?.dueFormatted}"`;
      break;
    }

    default: {
      snippet = `import { calculateZakat } from 'zakat-mal';

// Universal Multi-Asset Zakat Calculation Engine
const result = calculateZakat({
  category: '${activeTab}',
  currency: '${activeCurrency}',
  calendar: '${activeCalendar}'
});

console.log(result.isObligatory); // ${lastCalculatedResult?.isObligatory}
console.log(result.zakatDue);      // "${lastCalculatedResult?.dueFormatted}"`;
    }
  }

  codeBlock.textContent = snippet;
}

// Copy Install Command
function copyInstallCmd() {
  const cmd = 'npm install zakat-mal';
  navigator.clipboard.writeText(cmd).then(() => {
    const label = document.getElementById('copy-install-label');
    if (label) {
      const orig = label.textContent;
      label.textContent = 'Copied!';
      setTimeout(() => { label.textContent = orig; }, 2000);
    }
  });
}

// Copy Code Snippet
function copyCodeSnippet() {
  const code = document.getElementById('code-snippet-body')?.textContent;
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('btn-copy-code');
    if (btn) {
      const origHtml = btn.innerHTML;
      btn.innerHTML = '<span>✓ Copied!</span>';
      setTimeout(() => { btn.innerHTML = origHtml; }, 2000);
    }
  });
}

// Modals Handling
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Open Niyyah / Akad Modal
function openAkadModal() {
  const tpl = NIYYAH_TEMPLATES[activeTab] || NIYYAH_TEMPLATES.gold;
  const title = document.getElementById('modal-akad-title');
  const arabic = document.getElementById('modal-arabic');
  const translit = document.getElementById('modal-transliteration');
  const english = document.getElementById('modal-translation');

  if (title) title.textContent = tpl.title;
  if (arabic) arabic.textContent = tpl.arabic;
  if (translit) translit.textContent = tpl.translit;
  if (english) english.textContent = tpl.english;

  openModal('modal-akad');
}

// Copy Niyyah Text
function copyNiyyahText() {
  const tpl = NIYYAH_TEMPLATES[activeTab] || NIYYAH_TEMPLATES.gold;
  const text = `${tpl.title}\n\n${tpl.arabic}\n\nTransliteration:\n${tpl.translit}\n\nEnglish Translation:\n${tpl.english}`;
  navigator.clipboard.writeText(text).then(() => {
    alert('Prayer text copied to clipboard!');
  });
}

// Open Certificate Modal
function openCertModal() {
  const idEl = document.getElementById('cert-id');
  const dateEl = document.getElementById('cert-date');
  const assetEl = document.getElementById('cert-asset');
  const baseEl = document.getElementById('cert-base');
  const nisabEl = document.getElementById('cert-nisab');
  const calEl = document.getElementById('cert-cal');
  const dueEl = document.getElementById('cert-due');

  if (idEl) idEl.textContent = generateCertificateChecksum();
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  if (assetEl) assetEl.textContent = activeTab.toUpperCase() + ' WEALTH';
  if (baseEl) baseEl.textContent = lastCalculatedResult?.baseFormatted || '-';
  if (nisabEl) nisabEl.textContent = lastCalculatedResult?.nisabFormatted || '-';
  if (calEl) calEl.textContent = activeCalendar === 'solar' ? 'Gregorian Solar (2.577% AAOIFI)' : 'Lunar Hijri (2.500%)';
  if (dueEl) dueEl.textContent = lastCalculatedResult?.dueFormatted || '$0.00';

  openModal('modal-cert');
}

// Currency Switch Handler
function handleCurrencyChange(e) {
  activeCurrency = e.target.value;
  const cfg = CURRENCY_REGISTRY[activeCurrency] || CURRENCY_REGISTRY.USD;

  // Update all currency prefixes across inputs
  const prefixes = document.querySelectorAll('.input-prefix');
  prefixes.forEach((p) => {
    p.textContent = cfg.symbol;
  });

  // Update gold price inputs to realistic benchmarks
  const goldPriceInputs = [
    'gold-price',
    'cash-gold-price',
    'income-gold-price',
    'biz-gold-price',
    'corp-gold-price',
    'crypto-gold-price'
  ];
  goldPriceInputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = cfg.goldDefault;
  });

  recalculateActiveModule();
}

// Calendar Switch Handler
function handleCalendarChange(e) {
  activeCalendar = e.target.value;
  recalculateActiveModule();
}

// Theme Toggle
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', nextTheme);
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Tabs
  const tabButtons = document.querySelectorAll('.tab-pill');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      activeTab = btn.getAttribute('data-tab') || 'gold';

      // Switch pane
      const panes = document.querySelectorAll('.pane-content');
      panes.forEach((p) => {
        if (p.getAttribute('data-pane') === activeTab) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      recalculateActiveModule();
    });
  });

  // Currency select
  const currSelect = document.getElementById('currency-select');
  if (currSelect) currSelect.addEventListener('change', handleCurrencyChange);

  // Calendar select
  const calSelect = document.getElementById('calendar-select');
  if (calSelect) calSelect.addEventListener('change', handleCalendarChange);

  // All input changes trigger recalculation
  const allInputs = document.querySelectorAll('.field-input, .custom-select');
  allInputs.forEach((input) => {
    input.addEventListener('input', recalculateActiveModule);
    input.addEventListener('change', recalculateActiveModule);
  });

  // Click outside modal closes it
  const modals = document.querySelectorAll('.modal-backdrop');
  modals.forEach((m) => {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        m.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
}

// Initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  setupEventListeners();
  recalculateActiveModule();
});
