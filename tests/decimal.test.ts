import { describe, it, expect } from 'vitest';
import { Decimal, D } from '../src/core/decimal';

describe('Decimal High-Precision Math Engine', () => {
  it('correctly avoids IEEE-754 floating point issues (0.1 + 0.2 = 0.3)', () => {
    const a = D(0.1);
    const b = D(0.2);
    const sum = a.add(b);
    expect(sum.toString()).toBe('0.3');
    expect(sum.equals('0.3')).toBe(true);
  });

  it('handles large numbers and arbitrary addition', () => {
    const a = D('999999999999999999.99');
    const b = D('0.01');
    const sum = a.add(b);
    expect(sum.toString()).toBe('1000000000000000000');
  });

  it('handles exact subtraction', () => {
    const a = D('100.55');
    const b = D('25.30');
    expect(a.sub(b).toString()).toBe('75.25');

    const negativeRes = D('10').sub(D('25'));
    expect(negativeRes.toString()).toBe('-15');
    expect(negativeRes.isNegative()).toBe(true);
  });

  it('handles multiplication with high precision', () => {
    const goldGrams = D('85');
    const rate = D('0.025');
    const zakatDueGrams = goldGrams.mul(rate);
    expect(zakatDueGrams.toString()).toBe('2.125');
  });

  it('handles division with configurable scale and precision', () => {
    const annual = D('1000');
    const monthly = annual.div(12, 4);
    expect(monthly.toString()).toBe('83.3333');
  });

  it('throws on division by zero', () => {
    expect(() => D(100).div(0)).toThrow('Division by zero');
  });

  it('compares values correctly (gt, gte, lt, lte, equals)', () => {
    const a = D('85.0001');
    const b = D('85');
    expect(a.gt(b)).toBe(true);
    expect(b.lt(a)).toBe(true);
    expect(D('85.00').equals(D('85'))).toBe(true);
  });

  it('formats to fixed decimals with various rounding modes', () => {
    const num = D('123.456');
    expect(num.toFixed(2, 'round')).toBe('123.46');
    expect(num.toFixed(2, 'floor')).toBe('123.45');
    expect(num.toFixed(2, 'ceil')).toBe('123.46');
    expect(num.toFixed(0, 'round')).toBe('123');
  });
});
