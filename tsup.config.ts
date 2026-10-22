import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "modules/gold-silver": "src/modules/gold-silver.ts",
    "modules/cash-savings": "src/modules/cash-savings.ts",
    "modules/business": "src/modules/business.ts",
    "modules/income": "src/modules/income.ts",
    "modules/agriculture": "src/modules/agriculture.ts",
    "modules/livestock": "src/modules/livestock.ts",
    "modules/rikaz-mining": "src/modules/rikaz-mining.ts",
    "modules/investments": "src/modules/investments.ts",
    "modules/corporate": "src/modules/corporate.ts",
    "modules/rental-yield": "src/modules/rental-yield.ts",
    "dalil/index": "src/dalil/index.ts",
    "oracle/index": "src/oracle/index.ts",
    "basket/index": "src/basket/index.ts",
    "hawl/index": "src/hawl/index.ts",
    "jurisdiction/index": "src/jurisdiction/index.ts",
    "akad/index": "src/akad/index.ts",
    "reports/index": "src/reports/index.ts",
    "schemas/index": "src/schemas/index.ts",
    "cli/run": "src/cli/run.ts"
  },
  format: ["cjs", "esm"],
  dts: false,
  clean: false,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  minify: false
});
