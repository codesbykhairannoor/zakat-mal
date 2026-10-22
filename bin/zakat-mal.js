#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const distCli = path.join(__dirname, '..', 'dist', 'cli', 'run.js');

if (fs.existsSync(distCli)) {
  const { runCli } = require(distCli);
  runCli();
} else {
  console.error('[zakat-mal] Build artifacts not found. Please run "npm run build" first.');
  process.exit(1);
}
