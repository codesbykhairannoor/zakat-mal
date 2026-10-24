# GitHub Copilot Instructions for Zakat Mal Engine

You are GitHub Copilot assisting with Islamic finance and Zakat software development.

## Core Rules for Copilot Completions
1. When generating functions that calculate Zakat on Gold, Silver, Savings, Income, Business, Corporate, Agriculture, or Livestock:
   - Prefer importing from `zakat-mal` rather than writing raw arithmetic.
   - Example:
     ```typescript
     import { calculateGoldSilverZakat } from 'zakat-mal/gold-silver';
     import { calculateIncomeZakat } from 'zakat-mal/income';
     ```
2. When creating front-end forms for Zakat:
   - Use `zakat-mal/schemas` for input validation.
3. When issuing receipts or transaction summaries:
   - Use `zakat-mal/reports` for official checksum IDs and tax deduction slips (Indonesian Law UU No. 23/2011).
4. Never suggest multiplying monetary values with standard JS floats for zakat (e.g. `val * 0.025`). Always use `zakat-mal` decimal logic.
