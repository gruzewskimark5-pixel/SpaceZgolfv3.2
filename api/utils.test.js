import { test } from 'node:test';
import assert from 'node:assert';
import { normalizeZ, calcDI } from './utils.js';

test('normalizeZ should clamp values and normalize to [0, 1]', () => {
  assert.strictEqual(normalizeZ(-3), 0);
  assert.strictEqual(normalizeZ(3), 1);
  assert.strictEqual(normalizeZ(0), 0.5);
  assert.strictEqual(normalizeZ(-4), 0);
  assert.strictEqual(normalizeZ(4), 1);
  assert.strictEqual(normalizeZ(-2), ( -2 + 3 ) / 6);
});

test('calcDI should calculate dominance index correctly', () => {
  // ec=1, z=3 (normalizedZ=1) -> 1 * 0.65 + 1 * 0.35 = 1
  assert.strictEqual(calcDI(1, 3), 1);

  // ec=0, z=-3 (normalizedZ=0) -> 0 * 0.65 + 0 * 0.35 = 0
  assert.strictEqual(calcDI(0, -3), 0);

  // ec=0.5, z=0 (normalizedZ=0.5) -> 0.5 * 0.65 + 0.5 * 0.35 = 0.5
  assert.strictEqual(calcDI(0.5, 0), 0.5);

  // Test rounding to 4 decimal places
  // ec=0.12345, z=0 -> 0.12345 * 0.65 + 0.5 * 0.35 = 0.0802425 + 0.175 = 0.2552425 -> 0.2552
  assert.strictEqual(calcDI(0.12345, 0), 0.2552);
});

test('calcDI should handle string inputs', () => {
  assert.strictEqual(calcDI('1', '3'), 1);
});
