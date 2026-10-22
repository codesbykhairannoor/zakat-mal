/**
 * zakat-mal: High-Precision Arbitrary Decimal Engine
 *
 * Designed specifically for Shariah compliance and Islamic finance to eliminate
 * IEEE-754 binary floating-point roundoff errors (e.g. 0.1 + 0.2 != 0.3).
 * Zero runtime dependencies, portable across Node.js, Browsers, React Native, and Edge workers.
 */

export type RoundingMode = 'round' | 'floor' | 'ceil' | 'trunc';

export class Decimal {
  private readonly sign: number; // 1 for positive/zero, -1 for negative
  private readonly integerDigits: string; // digits before decimal
  private readonly fractionDigits: string; // digits after decimal

  constructor(value: number | string | Decimal | bigint) {
    if (value instanceof Decimal) {
      this.sign = value.sign;
      this.integerDigits = value.integerDigits;
      this.fractionDigits = value.fractionDigits;
      return;
    }

    let str = typeof value === 'bigint' ? value.toString() : String(value).trim();
    if (!str || str === 'NaN' || str === 'null' || str === 'undefined') {
      str = '0';
    }

    // Handle scientific notation e.g. 1.2e-5
    if (/[eE]/.test(str)) {
      str = Decimal.fromScientific(str);
    }

    let isNeg = false;
    if (str.startsWith('-')) {
      isNeg = true;
      str = str.slice(1);
    } else if (str.startsWith('+')) {
      str = str.slice(1);
    }

    // Strip out commas or spaces in formatted input e.g. "1,000,000.50"
    str = str.replace(/[, ]/g, '');

    const dotIndex = str.indexOf('.');
    let intPart = '';
    let fracPart = '';

    if (dotIndex === -1) {
      intPart = str.replace(/[^0-9]/g, '');
      fracPart = '';
    } else {
      intPart = str.slice(0, dotIndex).replace(/[^0-9]/g, '');
      fracPart = str.slice(dotIndex + 1).replace(/[^0-9]/g, '');
    }

    // Normalize leading zeros in integer part
    intPart = intPart.replace(/^0+(?=\d)/, '');
    if (!intPart) intPart = '0';

    // Normalize trailing zeros in fractional part
    fracPart = fracPart.replace(/0+$/, '');

    // Check if zero
    if (intPart === '0' && fracPart === '') {
      this.sign = 1;
      this.integerDigits = '0';
      this.fractionDigits = '';
    } else {
      this.sign = isNeg ? -1 : 1;
      this.integerDigits = intPart;
      this.fractionDigits = fracPart;
    }
  }

  private static fromScientific(numStr: string): string {
    const [coeff, expStr] = numStr.split(/[eE]/);
    if (!expStr || !coeff) return numStr;
    const exp = parseInt(expStr, 10);
    const parts = coeff.split('.');
    const intP = parts[0] ?? '0';
    const fracP = parts[1] ?? '';
    const isNeg = intP.startsWith('-');
    const cleanInt = isNeg ? intP.slice(1) : intP;

    if (exp === 0) return `${isNeg ? '-' : ''}${cleanInt}${fracP ? '.' + fracP : ''}`;

    if (exp > 0) {
      if (exp >= fracP.length) {
        const zeros = '0'.repeat(exp - fracP.length);
        return `${isNeg ? '-' : ''}${cleanInt}${fracP}${zeros}`;
      } else {
        const shiftedInt = cleanInt + fracP.slice(0, exp);
        const shiftedFrac = fracP.slice(exp);
        return `${isNeg ? '-' : ''}${shiftedInt}.${shiftedFrac}`;
      }
    } else {
      const absExp = Math.abs(exp);
      if (absExp <= cleanInt.length) {
        const cut = cleanInt.length - absExp;
        const shiftedInt = cut === 0 ? '0' : cleanInt.slice(0, cut);
        const shiftedFrac = cleanInt.slice(cut) + fracP;
        return `${isNeg ? '-' : ''}${shiftedInt}.${shiftedFrac}`;
      } else {
        const zeros = '0'.repeat(absExp - cleanInt.length);
        return `${isNeg ? '-' : ''}0.${zeros}${cleanInt}${fracP}`;
      }
    }
  }

  public isZero(): boolean {
    return this.integerDigits === '0' && this.fractionDigits === '';
  }

  public isNegative(): boolean {
    return this.sign === -1 && !this.isZero();
  }

  public isPositive(): boolean {
    return this.sign === 1 && !this.isZero();
  }

  public abs(): Decimal {
    if (this.sign === 1) return this;
    return new Decimal(this.toString().replace(/^-/, ''));
  }

  public neg(): Decimal {
    if (this.isZero()) return this;
    return new Decimal((this.sign === 1 ? '-' : '') + this.integerDigits + (this.fractionDigits ? '.' + this.fractionDigits : ''));
  }

  public compare(other: Decimal | number | string): number {
    const b = other instanceof Decimal ? other : new Decimal(other);

    if (this.sign !== b.sign) {
      if (this.isZero() && b.isZero()) return 0;
      return this.sign > b.sign ? 1 : -1;
    }

    // Same sign
    let res = 0;
    if (this.integerDigits.length !== b.integerDigits.length) {
      res = this.integerDigits.length > b.integerDigits.length ? 1 : -1;
    } else if (this.integerDigits !== b.integerDigits) {
      res = this.integerDigits > b.integerDigits ? 1 : -1;
    } else {
      // Compare fractions
      const maxFrac = Math.max(this.fractionDigits.length, b.fractionDigits.length);
      const fracA = this.fractionDigits.padEnd(maxFrac, '0');
      const fracB = b.fractionDigits.padEnd(maxFrac, '0');
      if (fracA > fracB) res = 1;
      else if (fracA < fracB) res = -1;
      else res = 0;
    }

    return this.sign === -1 ? -res : res;
  }

  public equals(other: Decimal | number | string): boolean {
    return this.compare(other) === 0;
  }

  public gt(other: Decimal | number | string): boolean {
    return this.compare(other) > 0;
  }

  public gte(other: Decimal | number | string): boolean {
    return this.compare(other) >= 0;
  }

  public lt(other: Decimal | number | string): boolean {
    return this.compare(other) < 0;
  }

  public lte(other: Decimal | number | string): boolean {
    return this.compare(other) <= 0;
  }

  public add(other: Decimal | number | string): Decimal {
    const b = other instanceof Decimal ? other : new Decimal(other);

    if (this.sign !== b.sign) {
      // a + (-b) = a - b
      return this.sub(b.neg());
    }

    // Both same sign
    const maxFrac = Math.max(this.fractionDigits.length, b.fractionDigits.length);
    const rawA = BigInt(this.integerDigits + this.fractionDigits.padEnd(maxFrac, '0'));
    const rawB = BigInt(b.integerDigits + b.fractionDigits.padEnd(maxFrac, '0'));
    const sum = rawA + rawB;

    let sumStr = sum.toString();
    if (maxFrac > 0) {
      if (sumStr.length <= maxFrac) {
        sumStr = '0.' + sumStr.padStart(maxFrac, '0');
      } else {
        const cut = sumStr.length - maxFrac;
        sumStr = sumStr.slice(0, cut) + '.' + sumStr.slice(cut);
      }
    }

    return new Decimal((this.sign === -1 ? '-' : '') + sumStr);
  }

  public sub(other: Decimal | number | string): Decimal {
    const b = other instanceof Decimal ? other : new Decimal(other);

    if (this.sign !== b.sign) {
      // a - (-b) = a + b
      return this.add(b.neg());
    }

    // Both same sign
    const maxFrac = Math.max(this.fractionDigits.length, b.fractionDigits.length);
    const rawA = BigInt(this.integerDigits + this.fractionDigits.padEnd(maxFrac, '0'));
    const rawB = BigInt(b.integerDigits + b.fractionDigits.padEnd(maxFrac, '0'));

    let diff: bigint;
    let resultSign = this.sign;

    if (rawA >= rawB) {
      diff = rawA - rawB;
    } else {
      diff = rawB - rawA;
      resultSign = -resultSign;
    }

    if (diff === 0n) return new Decimal(0);

    let diffStr = diff.toString();
    if (maxFrac > 0) {
      if (diffStr.length <= maxFrac) {
        diffStr = '0.' + diffStr.padStart(maxFrac, '0');
      } else {
        const cut = diffStr.length - maxFrac;
        diffStr = diffStr.slice(0, cut) + '.' + diffStr.slice(cut);
      }
    }

    return new Decimal((resultSign === -1 ? '-' : '') + diffStr);
  }

  public mul(other: Decimal | number | string): Decimal {
    const b = other instanceof Decimal ? other : new Decimal(other);

    if (this.isZero() || b.isZero()) return new Decimal(0);

    const fracLenA = this.fractionDigits.length;
    const fracLenB = b.fractionDigits.length;
    const totalFrac = fracLenA + fracLenB;

    const rawA = BigInt(this.integerDigits + this.fractionDigits);
    const rawB = BigInt(b.integerDigits + b.fractionDigits);
    const prod = rawA * rawB;

    const resultSign = this.sign * b.sign;
    let prodStr = prod.toString();

    if (totalFrac > 0) {
      if (prodStr.length <= totalFrac) {
        prodStr = '0.' + prodStr.padStart(totalFrac, '0');
      } else {
        const cut = prodStr.length - totalFrac;
        prodStr = prodStr.slice(0, cut) + '.' + prodStr.slice(cut);
      }
    }

    return new Decimal((resultSign === -1 ? '-' : '') + prodStr);
  }

  public div(other: Decimal | number | string, maxScale = 18): Decimal {
    const b = other instanceof Decimal ? other : new Decimal(other);

    if (b.isZero()) {
      throw new Error('Division by zero in Decimal calculation');
    }
    if (this.isZero()) return new Decimal(0);

    const fracLenA = this.fractionDigits.length;
    const fracLenB = b.fractionDigits.length;

    let rawA = BigInt(this.integerDigits + this.fractionDigits);
    const rawB = BigInt(b.integerDigits + b.fractionDigits);

    // Normalize scale: numerator needs extra zeros for required division precision
    const scaleShift = maxScale + fracLenB - fracLenA;
    if (scaleShift >= 0) {
      rawA = rawA * 10n ** BigInt(scaleShift);
    } else {
      rawA = rawA / 10n ** BigInt(Math.abs(scaleShift));
    }

    const quot = rawA / rawB;
    const resultSign = this.sign * b.sign;
    let quotStr = quot.toString();

    if (maxScale > 0) {
      if (quotStr.length <= maxScale) {
        quotStr = '0.' + quotStr.padStart(maxScale, '0');
      } else {
        const cut = quotStr.length - maxScale;
        quotStr = quotStr.slice(0, cut) + '.' + quotStr.slice(cut);
      }
    }

    return new Decimal((resultSign === -1 ? '-' : '') + quotStr);
  }

  public toFixed(digits = 2, mode: RoundingMode = 'round'): string {
    if (this.isZero()) {
      return digits > 0 ? '0.' + '0'.repeat(digits) : '0';
    }

    const isNeg = this.sign === -1;
    const curFrac = this.fractionDigits;

    if (curFrac.length <= digits) {
      const padded = curFrac.padEnd(digits, '0');
      const formatted = digits > 0 ? `${this.integerDigits}.${padded}` : this.integerDigits;
      return isNeg ? '-' + formatted : formatted;
    }

    // Truncate vs Round
    const intPartBig = BigInt(this.integerDigits);
    const truncatedFrac = curFrac.slice(0, digits);
    const nextDigit = parseInt(curFrac[digits] ?? '0', 10);

    let roundUp = false;
    if (mode === 'round') {
      roundUp = nextDigit >= 5;
    } else if (mode === 'ceil') {
      roundUp = !isNeg && curFrac.slice(digits).replace(/0+$/, '').length > 0;
    } else if (mode === 'floor') {
      roundUp = isNeg && curFrac.slice(digits).replace(/0+$/, '').length > 0;
    }

    if (!roundUp) {
      const formatted = digits > 0 ? `${this.integerDigits}.${truncatedFrac}` : this.integerDigits;
      return isNeg ? '-' + formatted : formatted;
    }

    // Add 1 to the smallest position
    if (digits === 0) {
      const roundedInt = intPartBig + 1n;
      return isNeg ? '-' + roundedInt.toString() : roundedInt.toString();
    }

    const combined = BigInt(this.integerDigits + truncatedFrac) + 1n;
    let resStr = combined.toString();

    if (resStr.length <= digits) {
      resStr = '0.' + resStr.padStart(digits, '0');
    } else {
      const cut = resStr.length - digits;
      resStr = resStr.slice(0, cut) + '.' + resStr.slice(cut);
    }

    return isNeg ? '-' + resStr : resStr;
  }

  public toString(): string {
    const isNeg = this.sign === -1 && !this.isZero();
    return (isNeg ? '-' : '') + this.integerDigits + (this.fractionDigits ? '.' + this.fractionDigits : '');
  }

  public toNumber(): number {
    return parseFloat(this.toString());
  }

  public static min(a: Decimal | number | string, b: Decimal | number | string): Decimal {
    const da = a instanceof Decimal ? a : new Decimal(a);
    const db = b instanceof Decimal ? b : new Decimal(b);
    return da.lte(db) ? da : db;
  }

  public static max(a: Decimal | number | string, b: Decimal | number | string): Decimal {
    const da = a instanceof Decimal ? a : new Decimal(a);
    const db = b instanceof Decimal ? b : new Decimal(b);
    return da.gte(db) ? da : db;
  }
}

export function D(val: number | string | Decimal | bigint): Decimal {
  return new Decimal(val);
}
