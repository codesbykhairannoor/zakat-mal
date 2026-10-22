import fs from "node:fs";
import path from "node:path";

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, "dist");

function resolveMjsSpecifier(filePath, specifier) {
  if (specifier.endsWith(".js") || specifier.endsWith(".mjs") || specifier.endsWith(".json")) {
    return specifier;
  }
  const dir = path.dirname(filePath);
  const targetCandidate = path.resolve(dir, specifier);
  if (fs.existsSync(targetCandidate) && fs.statSync(targetCandidate).isDirectory()) {
    return `${specifier}/index.mjs`;
  }
  return `${specifier}.mjs`;
}

if (fs.existsSync(distDir)) {
  // 1. Generate .d.mts from .d.ts with exact .mjs specifiers for ESM
  walkDir(distDir, (filePath) => {
    if (filePath.endsWith(".d.ts") && !filePath.endsWith(".d.ts.map")) {
      const mtsPath = filePath.replace(/\.d\.ts$/, ".d.mts");
      let content = fs.readFileSync(filePath, "utf-8");

      content = content.replace(/(from\s+['"])(\.\.?\/[^'"]+?)(['"])/g, (match, p1, p2, p3) => {
        const resolved = resolveMjsSpecifier(filePath, p2);
        return `${p1}${resolved}${p3}`;
      });

      content = content.replace(/(export\s+.*?\s+from\s+['"])(\.\.?\/[^'"]+?)(['"])/g, (match, p1, p2, p3) => {
        const resolved = resolveMjsSpecifier(filePath, p2);
        return `${p1}${resolved}${p3}`;
      });

      content = content.replace(/(import\(['"])(\.\.?\/[^'"]+?)(['"]\))/g, (match, p1, p2, p3) => {
        const resolved = resolveMjsSpecifier(filePath, p2);
        return `${p1}${resolved}${p3}`;
      });

      fs.writeFileSync(mtsPath, content, "utf-8");
    }
  });

  // 2. Generate root shims for legacy node10 resolution
  const submodules = [
    { name: "gold-silver", target: "modules/gold-silver" },
    { name: "cash-savings", target: "modules/cash-savings" },
    { name: "business", target: "modules/business" },
    { name: "income", target: "modules/income" },
    { name: "agriculture", target: "modules/agriculture" },
    { name: "livestock", target: "modules/livestock" },
    { name: "rikaz-mining", target: "modules/rikaz-mining" },
    { name: "investments", target: "modules/investments" },
    { name: "corporate", target: "modules/corporate" },
    { name: "rental-yield", target: "modules/rental-yield" },
    { name: "dalil", target: "dalil/index" }
  ];

  for (const mod of submodules) {
    const jsShim = path.join(rootDir, `${mod.name}.js`);
    const dtsShim = path.join(rootDir, `${mod.name}.d.ts`);

    fs.writeFileSync(jsShim, `"use strict";\nmodule.exports = require("./dist/${mod.target}.js");\n`, "utf-8");
    fs.writeFileSync(dtsShim, `export * from "./dist/${mod.target}";\n`, "utf-8");
  }

  console.log("Successfully generated .d.mts and node10 compatibility shims with precise directory resolution.");
}
