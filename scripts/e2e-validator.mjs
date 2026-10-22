#!/usr/bin/env node
/**
 * zakat-mal: End-to-End Package Validator & Consumer Test Harness
 *
 * Simulates a real-world external developer environment:
 * 1. Builds the package
 * 2. Packs it into a real .tgz tarball (npm pack)
 * 3. Creates an isolated external sandbox project
 * 4. Installs the tarball using npm install <tgz>
 * 5. Runs ESM, CommonJS, TypeScript types, and CLI binary tests
 * 6. Validates math accuracy and Fiqh dalil outputs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const ROOT_DIR = process.cwd();
const SANDBOX_DIR = path.join(ROOT_DIR, '.sandbox-validator');

// Color helpers for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function logHeader(text) {
  console.log(`\n${colors.cyan}${colors.bold}=== [ ${text} ] ===${colors.reset}`);
}

function logSuccess(text) {
  console.log(`  ${colors.green}✔ ${text}${colors.reset}`);
}

function logStep(text) {
  console.log(`${colors.yellow}▶ ${text}${colors.reset}`);
}

function logError(text) {
  console.error(`  ${colors.red}✖ ${text}${colors.reset}`);
}

async function runValidator() {
  const startTime = Date.now();
  console.log(`\n${colors.magenta}${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}   zakat-mal: End-to-End Automated Consumer Validator Harness  ${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}================================================================${colors.reset}`);
  console.log(`Node version : ${process.version}`);
  console.log(`Platform     : ${process.platform} (${process.arch})`);
  console.log(`Target Dir   : ${ROOT_DIR}\n`);

  const results = [];

  try {
    // -------------------------------------------------------------
    // STAGE 1: Fresh Build
    // -------------------------------------------------------------
    logHeader('STAGE 1: Compiling Package via tsup & tsc');
    logStep('Running npm run build...');
    execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });
    logSuccess('Dist bundle successfully generated (ESM, CJS, DTS).');
    results.push({ name: 'Compilation & DTS Generation', status: 'PASS' });

    // -------------------------------------------------------------
    // STAGE 2: Tarball Packaging (npm pack)
    // -------------------------------------------------------------
    logHeader('STAGE 2: Generating Production Tarball');
    logStep('Running npm pack...');
    const packOutput = execSync('npm pack', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
    const tarballFileName = packOutput.split('\n').pop().trim();
    const tarballPath = path.resolve(ROOT_DIR, tarballFileName);

    if (!fs.existsSync(tarballPath)) {
      throw new Error(`Tarball not found at expected path: ${tarballPath}`);
    }

    const stats = fs.statSync(tarballPath);
    logSuccess(`Created tarball: ${colors.bold}${tarballFileName}${colors.reset} (${(stats.size / 1024).toFixed(1)} KB)`);
    results.push({ name: 'Tarball Creation (npm pack)', status: 'PASS' });

    // -------------------------------------------------------------
    // STAGE 3: Setup Isolated Consumer Sandbox
    // -------------------------------------------------------------
    logHeader('STAGE 3: Setting Up Isolated Sandbox Project');
    logStep(`Creating directory: ${SANDBOX_DIR}`);

    if (fs.existsSync(SANDBOX_DIR)) {
      fs.rmSync(SANDBOX_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(SANDBOX_DIR, { recursive: true });

    // Create a consumer package.json
    const consumerPkg = {
      name: 'external-zakat-consumer-app',
      version: '1.0.0',
      private: true,
      description: 'Automated test consumer for zakat-mal package'
    };
    fs.writeFileSync(path.join(SANDBOX_DIR, 'package.json'), JSON.stringify(consumerPkg, null, 2));

    // Create .npmrc in sandbox to enforce legacy-peer-deps
    fs.writeFileSync(path.join(SANDBOX_DIR, '.npmrc'), 'legacy-peer-deps=true\n');

    // -------------------------------------------------------------
    // STAGE 4: Real NPM Install
    // -------------------------------------------------------------
    logStep(`Installing ${tarballFileName} into sandbox...`);
    // Format path with forward slashes for cross-platform compatibility
    const normalizedTarballPath = tarballPath.replace(/\\/g, '/');
    execSync(`npm install "${normalizedTarballPath}" --no-fund --no-audit`, {
      cwd: SANDBOX_DIR,
      stdio: 'inherit'
    });

    const installedPkgPath = path.join(SANDBOX_DIR, 'node_modules', 'zakat-mal');
    if (!fs.existsSync(installedPkgPath)) {
      throw new Error('Package was not properly installed into node_modules/zakat-mal');
    }
    logSuccess('zakat-mal successfully installed into isolated sandbox.');
    results.push({ name: 'Sandbox Tarball Installation', status: 'PASS' });

    // -------------------------------------------------------------
    // STAGE 5: ESM Consumer Test
    // -------------------------------------------------------------
    logHeader('STAGE 5: Validating ESM Consumer (import ... from "zakat-mal")');
    const esmTestFile = path.join(SANDBOX_DIR, 'test-esm.mjs');
    const esmTestCode = `
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
  getDalilsForCategory,
  searchDalil,
  ISLAMIC_CONSTANTS,
  Decimal,
  D
} from 'zakat-mal';

// Subpath import test
import { calculateGoldSilverZakat as goldFromSubpath } from 'zakat-mal/gold-silver';
import { calculateLivestockZakat as livestockFromSubpath } from 'zakat-mal/livestock';
import { getAllDalils as dalilFromSubpath } from 'zakat-mal/dalil';

console.log('Testing ESM root & subpath imports...');

// 1. Test Gold calculation (85g @ 1.5M = 3,187,500.00 IDR)
const goldRes = calculateGoldSilverZakat({
  goldGrams: 85,
  goldPricePerGram: 1500000,
  calendar: 'hijri'
});
if (!goldRes.isObligatory) throw new Error('Gold should be obligatory at 85g');
if (goldRes.zakatDue !== '3187500.00') throw new Error('Gold zakat math mismatch: ' + goldRes.zakatDue);
console.log('  ✔ Gold 85g calculation passed (3,187,500 IDR)');

// 2. Test Subpath consistency
const subGold = goldFromSubpath({ goldGrams: 85, goldPricePerGram: 1500000 });
if (subGold.zakatDue !== goldRes.zakatDue) throw new Error('Subpath import mismatch');
console.log('  ✔ Subpath import zakat-mal/gold-silver passed');

// 3. Test Livestock Cattle Hadith combination (75 heads = 1 Tabi + 1 Musinnah)
const cattleRes = calculateLivestockZakat({ animalType: 'cattle', count: 75 });
if (!cattleRes.isObligatory) throw new Error('Cattle 75 should be obligatory');
const hasTabi = cattleRes.details.itemsDue.some(i => i.arabicTerm.includes('تَبِيع'));
const hasMusinnah = cattleRes.details.itemsDue.some(i => i.arabicTerm.includes('مُسِنَّة'));
if (!hasTabi || !hasMusinnah) throw new Error('Cattle brackets mismatch');
console.log('  ✔ Livestock Cattle 75 heads passed: ' + cattleRes.zakatDue);

// 4. Test Corporate AAOIFI Standard 35 (Solar rate 2.577%)
const corpRes = calculateCorporateZakat({
  currentAssets: 1000000000,
  currentLiabilities: 0,
  goldPricePerGram: 1500000,
  calendar: 'gregorian'
});
if (corpRes.zakatDue !== '25770000.00') throw new Error('Corporate AAOIFI 35 solar rate mismatch: ' + corpRes.zakatDue);
console.log('  ✔ Corporate AAOIFI 35 Solar 2.577% passed (25,770,000 IDR)');

// 5. Test Unified Portfolio Multi-Asset
const portfolio = calculatePortfolioZakat({
  goldSilver: { goldGrams: 100, goldPricePerGram: 1500000 },
  cashSavings: { bankSavings: 200000000, goldPricePerGram: 1500000 },
  currency: 'IDR'
});
if (portfolio.obligatoryCount !== 2) throw new Error('Portfolio obligatory count mismatch');
console.log('  ✔ Unified Portfolio Calculation passed (Total: ' + portfolio.totalZakatDueMonetary + ' IDR)');

// 6. Test Dalil Retrieval
const allDalils = getAllDalils();
if (allDalils.length < 10) throw new Error('Dalil count too low');
const goldDalils = getDalilsForCategory('gold_silver');
if (goldDalils.length < 3) throw new Error('Gold dalils missing');
console.log('  ✔ Dalil Database retrieval passed (' + allDalils.length + ' official dalils loaded)');
`;
    fs.writeFileSync(esmTestFile, esmTestCode);

    logStep('Executing test-esm.mjs in sandbox...');
    execSync('node test-esm.mjs', { cwd: SANDBOX_DIR, stdio: 'inherit' });
    logSuccess('ESM Consumer Test PASSED 100%.');
    results.push({ name: 'ESM Module Import & Execution', status: 'PASS' });

    // -------------------------------------------------------------
    // STAGE 6: CommonJS Consumer Test
    // -------------------------------------------------------------
    logHeader('STAGE 6: Validating CommonJS Consumer (require("zakat-mal"))');
    const cjsTestFile = path.join(SANDBOX_DIR, 'test-cjs.cjs');
    const cjsTestCode = `
const {
  calculatePortfolioZakat,
  calculateGoldSilverZakat,
  calculateBusinessZakat,
  calculateIncomeZakat,
  getAllDalils,
  D,
  ISLAMIC_CONSTANTS
} = require('zakat-mal');

const { calculateGoldSilverZakat: goldSub } = require('zakat-mal/gold-silver');
const { getAllDalils: dalilSub } = require('zakat-mal/dalil');

console.log('Testing CommonJS require()...');

const res = calculateGoldSilverZakat({
  goldGrams: 100,
  goldPricePerGram: 1500000,
  calendar: 'hijri'
});

if (res.zakatDue !== '3750000.00') {
  throw new Error('CommonJS gold zakat mismatch: ' + res.zakatDue);
}

const dalils = dalilSub();
if (!dalils || dalils.length < 10) {
  throw new Error('CommonJS subpath dalil failed');
}

console.log('  ✔ CommonJS require() and subpath exports passed.');
`;
    fs.writeFileSync(cjsTestFile, cjsTestCode);

    logStep('Executing test-cjs.cjs in sandbox...');
    execSync('node test-cjs.cjs', { cwd: SANDBOX_DIR, stdio: 'inherit' });
    logSuccess('CommonJS Consumer Test PASSED 100%.');
    results.push({ name: 'CommonJS Require & Execution', status: 'PASS' });

    // -------------------------------------------------------------
    // STAGE 7: CLI Binary Test (npx zakat-mal)
    // -------------------------------------------------------------
    logHeader('STAGE 7: Validating CLI Binary Execution');
    logStep('Running npx zakat-mal gold in sandbox...');
    const cliOutputGold = execSync('npx zakat-mal gold --grams 100 --price 1500000', {
      cwd: SANDBOX_DIR,
      encoding: 'utf8'
    });
    if (!cliOutputGold.includes('WAJIB ZAKAT') || !cliOutputGold.includes('3750000.00')) {
      throw new Error('CLI output unexpected:\n' + cliOutputGold);
    }
    logSuccess('CLI Binary "zakat-mal gold" passed.');

    logStep('Running npx zakat-mal livestock in sandbox...');
    const cliOutputLivestock = execSync('npx zakat-mal livestock --type cattle --count 75', {
      cwd: SANDBOX_DIR,
      encoding: 'utf8'
    });
    if (!cliOutputLivestock.includes('تَبِيع') || !cliOutputLivestock.includes('مُسِنَّة')) {
      throw new Error('CLI livestock output unexpected:\n' + cliOutputLivestock);
    }
    logSuccess('CLI Binary "zakat-mal livestock" passed.');
    results.push({ name: 'CLI Binary Execution (npx zakat-mal)', status: 'PASS' });

    // -------------------------------------------------------------
    // STAGE 8: TypeScript Consumer Typecheck
    // -------------------------------------------------------------
    logHeader('STAGE 8: Validating TypeScript Declarations (.d.ts)');
    const tsConfigFile = path.join(SANDBOX_DIR, 'tsconfig.json');
    const tsConfigContent = {
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        skipLibCheck: true,
        noEmit: true
      },
      include: ['test-types.ts']
    };
    fs.writeFileSync(tsConfigFile, JSON.stringify(tsConfigContent, null, 2));

    const tsTestFile = path.join(SANDBOX_DIR, 'test-types.ts');
    const tsTestCode = `
import {
  calculateGoldSilverZakat,
  GoldSilverInput,
  ZakatResult,
  GoldSilverDetails,
  DalilReference,
  MultiAssetPortfolioInput,
  calculatePortfolioZakat
} from 'zakat-mal';

const input: GoldSilverInput = {
  goldGrams: 100,
  goldPricePerGram: 1500000,
  calendar: 'hijri'
};

const result: ZakatResult<GoldSilverDetails> = calculateGoldSilverZakat(input);
const zakatAmount: string = result.zakatDue;
const isObligatory: boolean = result.isObligatory;
const dalils: DalilReference[] = result.dalilReferences;

const portfolioInput: MultiAssetPortfolioInput = {
  goldSilver: input
};
const portfolioRes = calculatePortfolioZakat(portfolioInput);
console.log('TypeScript types verification successful.');
`;
    fs.writeFileSync(tsTestFile, tsTestCode);

    logStep('Type-checking consumer code with tsc inside sandbox...');
    execSync('npx tsc', {
      cwd: SANDBOX_DIR,
      stdio: 'inherit'
    });
    logSuccess('TypeScript .d.ts types resolved with zero compiler errors.');
    results.push({ name: 'TypeScript Typecheck (.d.ts)', status: 'PASS' });

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    if (process.argv.includes('--keep-sandbox')) {
      console.log(`\n${colors.yellow}Preserving sandbox directory at: ${SANDBOX_DIR}${colors.reset}`);
    } else {
      fs.rmSync(SANDBOX_DIR, { recursive: true, force: true });
      if (fs.existsSync(tarballPath)) {
        fs.unlinkSync(tarballPath);
      }
      logSuccess('Cleaned up sandbox and test tarball.');
    }

    // -------------------------------------------------------------
    // FINAL SCORECARD
    // -------------------------------------------------------------
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n${colors.green}${colors.bold}================================================================${colors.reset}`);
    console.log(`${colors.green}${colors.bold}             ALL VALIDATOR CHECKS PASSED (100%)                ${colors.reset}`);
    console.log(`${colors.green}${colors.bold}================================================================${colors.reset}`);
    console.log(`Total duration: ${elapsed}s\n`);

    console.table(results);

    console.log(`\n${colors.cyan}${colors.bold}CONCLUSION:${colors.reset}`);
    console.log(`The package ${colors.bold}zakat-mal@1.0.0${colors.reset} is fully production-ready,`);
    console.log(`installs cleanly via npm, and passes all ESM, CommonJS, TypeScript, and CLI requirements.\n`);

  } catch (error) {
    console.error(`\n${colors.red}${colors.bold}[VALIDATOR FAILURE]${colors.reset} ${error.message}`);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    process.exit(1);
  }
}

runValidator();
