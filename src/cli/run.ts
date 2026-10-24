#!/usr/bin/env node
/**
 * zakat-mal: Global Command-Line Interface (CLI)
 * Defaults to international English ('en') with opt-in Indonesian ('id') and Arabic ('ar').
 */

import { calculateGoldSilverZakat } from '../modules/gold-silver';
import { calculateCashSavingsZakat } from '../modules/cash-savings';
import { calculateBusinessZakat } from '../modules/business';
import { calculateIncomeZakat } from '../modules/income';
import { calculateAgricultureZakat } from '../modules/agriculture';
import { calculateLivestockZakat } from '../modules/livestock';
import { calculateCryptoZakat } from '../modules/investments';
import { calculateCorporateZakat } from '../modules/corporate';
import { getAllDalils, getDalilsForCategory, searchDalil } from '../dalil';
import { Locale, ZakatCategory } from '../types/common';

function parseArgs(args: string[]): { command: string; flags: Record<string, string> } {
  const command = args[0] || 'help';
  const flags: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg && arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = 'true';
      }
    }
  }

  return { command, flags };
}

export function runCli(argv = process.argv.slice(2)) {
  const { command, flags } = parseArgs(argv);
  const lang: Locale = (flags['lang'] || flags['locale'] || 'en') as Locale;
  const currency = flags['currency'] || (lang === 'id' ? 'IDR' : 'USD');

  console.log('\n======================================================');
  console.log('   zakat-mal: Global Fiqh-Verified Zakat Mal Engine   ');
  console.log('   AAOIFI Standard 35 | Bukhari & Muslim | OIC Fiqh   ');
  console.log('======================================================\n');

  try {
    switch (command.toLowerCase()) {
      case 'gold': {
        const grams = flags['grams'] || flags['g'] || '0';
        const price = flags['price'] || flags['p'] || (currency === 'IDR' ? '1500000' : '75');
        const karat = flags['karat'] ? parseInt(flags['karat'], 10) : 24;
        const calendar = (flags['calendar'] as any) || 'hijri';

        const res = calculateGoldSilverZakat({
          goldGrams: grams,
          goldPurityKarat: karat,
          goldPricePerGram: price,
          calendar,
          currency,
          locale: lang
        });

        printResult(lang === 'id' ? 'Zakat Emas & Perak' : 'Gold & Silver Zakat', res, lang);
        break;
      }

      case 'savings': {
        const total = flags['total'] || flags['t'] || '0';
        const debts = flags['debts'] || flags['d'] || '0';
        const goldPrice = flags['gold-price'] || flags['gp'] || (currency === 'IDR' ? '1500000' : '75');
        const calendar = (flags['calendar'] as any) || 'hijri';

        const res = calculateCashSavingsZakat({
          bankSavings: total,
          immediateDueDebts: debts,
          goldPricePerGram: goldPrice,
          calendar,
          currency,
          locale: lang
        });

        printResult(lang === 'id' ? 'Zakat Uang Simpanan & Tabungan' : 'Cash & Savings Zakat', res, lang);
        break;
      }

      case 'business': {
        const cash = flags['cash'] || '0';
        const inventory = flags['inventory'] || '0';
        const receivables = flags['receivables'] || '0';
        const debts = flags['debts'] || '0';
        const goldPrice = flags['gold-price'] || (currency === 'IDR' ? '1500000' : '75');

        const res = calculateBusinessZakat({
          cashAndLiquidAssets: cash,
          inventoryMarketValue: inventory,
          goodReceivables: receivables,
          dueOperationalDebts: debts,
          goldPricePerGram: goldPrice,
          currency,
          locale: lang
        });

        printResult(lang === 'id' ? 'Zakat Perdagangan / Perniagaan' : 'Business & Trade Zakat', res, lang);
        break;
      }

      case 'income': {
        const monthly = flags['monthly'] || '0';
        const expenses = flags['expenses'] || '0';
        const debts = flags['debts'] || '0';
        const useBaznas = flags['baznas'] === 'true' || (!flags['gold-price'] && currency === 'IDR');
        const goldPrice = flags['gold-price'] || (useBaznas ? undefined : (currency === 'IDR' ? '1500000' : '75'));

        const res = calculateIncomeZakat({
          grossIncome: monthly,
          basicLivingExpenses: expenses,
          dueDebtInstallment: debts,
          period: 'monthly',
          method: 'net',
          useBaznasNisab: useBaznas,
          goldPricePerGram: goldPrice,
          currency,
          locale: lang
        });

        const title = lang === 'id'
          ? `Zakat Penghasilan / Profesi (${useBaznas ? 'Nisab SK BAZNAS 2026' : 'Nisab Emas Pasar'})`
          : `Professional Income Zakat (${useBaznas ? 'BAZNAS 2026 Preset' : 'Market Gold Nisab'})`;

        printResult(title, res, lang);
        break;
      }

      case 'agriculture': {
        const weight = flags['weight'] || '0';
        const irrigation = (flags['irrigation'] as any) || 'natural';
        const price = flags['price'];

        const res = calculateAgricultureZakat({
          harvestWeightKg: weight,
          irrigation,
          produceType: 'grain_unhusked',
          pricePerKg: price,
          currency,
          locale: lang
        });

        printResult(lang === 'id' ? 'Zakat Pertanian' : 'Agriculture & Crops Zakat', res, lang);
        break;
      }

      case 'livestock': {
        const type = (flags['type'] as any) || 'cattle';
        const count = parseInt(flags['count'] || '0', 10);

        const res = calculateLivestockZakat({
          animalType: type,
          count,
          currency,
          locale: lang
        });

        printResult(lang === 'id' ? 'Zakat Hewan Ternak' : 'Livestock Zakat', res, lang);
        break;
      }

      case 'crypto': {
        const value = flags['value'] || '0';
        const goldPrice = flags['gold-price'] || (currency === 'IDR' ? '1500000' : '75');

        const res = calculateCryptoZakat({
          portfolioValue: value,
          goldPricePerGram: goldPrice,
          currency,
          locale: lang
        });

        printResult(lang === 'id' ? 'Zakat Aset Kripto' : 'Crypto Asset Zakat', res, lang);
        break;
      }

      case 'corporate': {
        const assets = flags['assets'] || '0';
        const liabilities = flags['liabilities'] || '0';
        const goldPrice = flags['gold-price'] || (currency === 'IDR' ? '1500000' : '75');
        const muslimPercent = flags['muslim-percent'] || '100';

        const res = calculateCorporateZakat({
          currentAssets: assets,
          currentLiabilities: liabilities,
          goldPricePerGram: goldPrice,
          muslimOwnershipPercentage: muslimPercent,
          currency,
          locale: lang
        });

        printResult(lang === 'id' ? 'Zakat Perusahaan (AAOIFI Standard 35)' : 'Corporate Zakat (AAOIFI Standard 35)', res, lang);
        break;
      }

      case 'dalil': {
        const query = flags['search'] || flags['q'];
        let topic = flags['topic'];

        if (topic) {
          const t = topic.toLowerCase();
          let category: ZakatCategory = 'gold_silver';
          if (t.includes('gold') || t.includes('emas') || t.includes('silver') || t.includes('perak')) {
            category = 'gold_silver';
          } else if (t.includes('saving') || t.includes('uang') || t.includes('tabungan') || t.includes('cash')) {
            category = 'cash_savings';
          } else if (t.includes('business') || t.includes('dagang') || t.includes('tijarah') || t.includes('niaga')) {
            category = 'business';
          } else if (t.includes('income') || t.includes('profesi') || t.includes('gaji') || t.includes('pendapatan')) {
            category = 'income';
          } else if (t.includes('agri') || t.includes('tani') || t.includes('panen') || t.includes('crop')) {
            category = 'agriculture';
          } else if (t.includes('live') || t.includes('ternak') || t.includes('sapi') || t.includes('kambing') || t.includes('unta')) {
            category = 'livestock';
          } else if (t.includes('corp') || t.includes('perusahaan') || t.includes('aaoifi')) {
            category = 'corporate';
          } else if (t.includes('rikaz') || t.includes('tambang') || t.includes('mining')) {
            category = 'rikaz_mining';
          } else if (t.includes('crypto') || t.includes('kripto') || t.includes('invest') || t.includes('saham')) {
            category = 'investments';
          } else if (t.includes('sewa') || t.includes('rent') || t.includes('mustaghallat')) {
            category = 'rental_yield';
          }

          const dalils = getDalilsForCategory(category);
          console.log(`\nDalil References for: [${topic} -> ${category}] (${dalils.length} found):\n`);
          printDalils(dalils, lang);
        } else if (query) {
          const dalils = searchDalil(query);
          console.log(`\nSearch results for "${query}" (${dalils.length} found):\n`);
          printDalils(dalils, lang);
        } else {
          const dalils = getAllDalils();
          console.log(`\nOfficial Shariah Dalil Database (${dalils.length} references):\n`);
          printDalils(dalils, lang);
        }
        break;
      }

      case 'help':
      default: {
        printHelp(lang);
        break;
      }
    }
  } catch (err: any) {
    console.error(`\n[ERROR] ${err.message}\n`);
    process.exit(1);
  }
}

function printResult(title: string, res: any, lang: Locale = 'en') {
  console.log(`--- [ ${title} ] ---`);
  const isEn = lang === 'en';
  const isId = lang === 'id';
  const isAr = lang === 'ar';

  const statusStr = res.isObligatory
    ? (isId ? 'WAJIB ZAKAT (Mencapai Nisab & Haul)' : isAr ? 'واجبة الزكاة (بلغت النصاب وحال الحول)' : 'OBLIGATORY (Nisab & Hawl Reached)')
    : (isId ? 'BELUM WAJIB ZAKAT' : isAr ? 'غير واجبة الزكاة' : 'NOT OBLIGATORY (Below Nisab or Hawl)');

  const labelStatus = isId ? 'Status Kewajiban' : isAr ? 'حكم الوجوب      ' : 'Obligation Status';
  const labelBase   = isId ? 'Basis Zakat     ' : isAr ? 'الوعاء الزكوي   ' : 'Zakatable Base   ';
  const labelNisab  = isId ? 'Batas Nisab     ' : isAr ? 'حد النصاب       ' : 'Nisab Threshold  ';
  const labelRate   = isId ? 'Tarif Zakat     ' : isAr ? 'نسبة الزكاة     ' : 'Applied Rate     ';
  const labelDue    = isId ? 'Zakat Terutang  ' : isAr ? 'الزكاة الواجبة   ' : 'Zakat Due        ';

  console.log(`${labelStatus} : ${statusStr}`);
  console.log(`${labelBase} : ${res.zakatableAmount}`);
  console.log(`${labelNisab} : ${res.nisabThreshold}`);
  console.log(`${labelRate} : ${res.rateApplied}`);
  console.log(`${labelDue} : ${res.zakatDue} ${res.currency || ''}`);

  if (res.notes && res.notes.length > 0) {
    console.log(isId ? "\nCatatan Syar'i:" : isAr ? '\nملاحظات فقهية شرعية:' : '\nShariah Fiqh Notes:');
    res.notes.forEach((n: string) => console.log(`  * ${n}`));
  }

  if (res.dalilReferences && res.dalilReferences.length > 0) {
    console.log(isId ? '\nDalil & Rujukan Utama:' : isAr ? '\nالأدلة والمراجع الشرعية:' : '\nKey Shariah References:');
    res.dalilReferences.forEach((d: any) => {
      const dTitle = (isEn && d.titleEn) ? d.titleEn : d.title;
      console.log(`  * [${d.source}] ${dTitle}`);
    });
  }
  console.log('\n');
}

function printDalils(dalils: any[], lang: Locale = 'en') {
  dalils.forEach((d, idx) => {
    const dTitle = (lang === 'en' && d.titleEn) ? d.titleEn : d.title;
    console.log(`${idx + 1}. [${d.source}] - ${dTitle}`);
    console.log(`   Arabic : ${d.arabicText}`);
    if (lang === 'id') {
      console.log(`   ID     : ${d.translationId}`);
    } else {
      console.log(`   EN     : ${d.translationEn}`);
    }
    console.log(`   Context: ${d.relevance}`);
    console.log('------------------------------------------------------');
  });
}

function printHelp(lang: Locale = 'en') {
  if (lang === 'id') {
    console.log(`Petunjuk Penggunaan CLI zakat-mal:

  Commands:
    gold          Hitung zakat emas/perak
                  --grams <berat_gram> --price <harga_per_gram> [--karat 24]
    savings       Hitung zakat tabungan/uang simpanan
                  --total <saldo_kas> --debts <utang_jatuh_tempo> --gold-price <harga_emas>
    business      Hitung zakat perdagangan ('urud at-tijarah)
                  --inventory <nilai_stok> --cash <kas> --receivables <piutang> --debts <utang> --gold-price <harga_emas>
    income        Hitung zakat profesi/penghasilan bulanan
                  --monthly <gaji_bruto> --expenses <kebutuhan_pokok> --debts <cicilan> [--gold-price <harga_emas>] [--baznas]
    agriculture   Hitung zakat hasil pertanian
                  --weight <berat_kg> --irrigation <natural|artificial|mixed> [--price <harga_per_kg>]
    livestock     Hitung zakat hewan ternak
                  --type <sheep|cattle|camel> --count <jumlah_ekor>
    crypto        Hitung zakat mata uang kripto
                  --value <nilai_portofolio> --gold-price <harga_emas> [--currency USD]
    corporate     Hitung zakat korporasi (AAOIFI Standard 35)
                  --assets <aset_lancar> --liabilities <liabilitas_lancar> --gold-price <harga_emas>
    dalil         Tampilkan rujukan dalil shahih
                  [--topic <kategori>] [--search <kata_kunci>]

  Global Flags:
    --lang <en|id|ar>       Pilihan bahasa output
    --currency <USD|IDR|..>  Mata uang perhitungan

  Contoh:
    npx zakat-mal gold --grams 100 --price 1500000 --lang id
    npx zakat-mal income --monthly 15000000 --expenses 5000000 --baznas
    npx zakat-mal livestock --type cattle --count 75
    npx zakat-mal dalil --topic gold
  `);
  } else {
    console.log(`zakat-mal: Global CLI Usage Instructions:

  Commands:
    gold          Calculate Gold & Silver Zakat
                  --grams <weight_grams> --price <price_per_gram> [--karat 24]
    savings       Calculate Cash & Bank Savings Zakat
                  --total <liquid_cash> --debts <immediate_due_debts> --gold-price <gold_price>
    business      Calculate Business Merchandise Zakat ('Urud at-Tijarah)
                  --inventory <stock_value> --cash <cash> --receivables <receivables> --debts <debts> --gold-price <gold_price>
    income        Calculate Professional Income / Earnings Zakat
                  --monthly <gross_salary> --expenses <basic_living> --debts <due_debts> --gold-price <gold_price>
    agriculture   Calculate Agricultural Harvest Zakat (5 Wasaq)
                  --weight <weight_kg> --irrigation <natural|artificial|mixed> [--price <price_per_kg>]
    livestock     Calculate Livestock Zakat (Sheep, Cattle, Camels)
                  --type <sheep|cattle|camel> --count <head_count>
    crypto        Calculate Digital Crypto Asset Zakat
                  --value <portfolio_value> --gold-price <gold_price> [--currency USD]
    corporate     Calculate Corporate Zakat (AAOIFI Standard 35)
                  --assets <current_assets> --liabilities <current_liabilities> --gold-price <gold_price>
    dalil         Browse and search authenticated Shariah dalil references
                  [--topic <category>] [--search <keyword>]

  Global Flags:
    --lang <en|id|ar>       Language of output (default: en)
    --currency <USD|EUR|..> Currency code (default: USD, or IDR when --baznas/--lang id)

  Examples:
    npx zakat-mal gold --grams 100 --price 75 --currency USD
    npx zakat-mal crypto --value 50000 --gold-price 75 --currency USD
    npx zakat-mal corporate --assets 1000000 --liabilities 200000 --gold-price 75
    npx zakat-mal livestock --type cattle --count 75
    npx zakat-mal dalil --topic corporate
  `);
  }
}

// Auto execute if invoked as script
if (typeof require !== 'undefined' && require.main === module) {
  runCli();
}
