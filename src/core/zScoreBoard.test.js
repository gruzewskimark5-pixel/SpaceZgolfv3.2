import { test, describe } from 'node:test';
import assert from 'node:assert';
import { zScoreBoard } from './zScoreBoard.js';

describe('zScoreBoard', () => {
  test('should handle an empty input array', () => {
    const result = zScoreBoard([]);
    assert.deepStrictEqual(result, []);
  });

  test('should correctly map source modules', () => {
    const input = [
      {
        source_module: 'golf_pro_v2',
        efficiency_coefficient: 0.8,
        domain_kpis: { zscore: 0 },
        signal_status: 'stable',
        system_timestamp: 123456789
      },
      {
        source_module: 'heart_rate_monitor',
        efficiency_coefficient: 0.7,
        domain_kpis: { zscore: 0 },
        signal_status: 'warning',
        system_timestamp: 123456790
      }
    ];

    const result = zScoreBoard(input);
    assert.strictEqual(result[0].module, 'SPACEZGOLF');
    assert.strictEqual(result[1].module, 'BLUE HORIZON');
  });

  test('should accurately calculate dominance index', () => {
    const input = [
      {
        source_module: 'golf',
        efficiency_coefficient: 0.8,
        domain_kpis: { zscore: 0 }, // normalizeZ(0) = 0.5
        signal_status: 'stable',
        system_timestamp: 123456789
      }
    ];
    // 0.8 * 0.65 + 0.5 * 0.35 = 0.52 + 0.175 = 0.695
    const result = zScoreBoard(input);
    assert.strictEqual(result[0].dominanceIndex, 0.695);
  });

  test('should clamp Z-score in normalizeZ function via dominance index calculation', () => {
    const input = [
      {
        source_module: 'golf',
        efficiency_coefficient: 1.0,
        domain_kpis: { zscore: 10 }, // should clamp to 1.0
        signal_status: 'stable',
        system_timestamp: 123456789
      },
      {
        source_module: 'golf',
        efficiency_coefficient: 1.0,
        domain_kpis: { zscore: -10 }, // should clamp to 0.0
        signal_status: 'stable',
        system_timestamp: 123456790
      }
    ];

    const result = zScoreBoard(input);
    // High Z (clamped to 1.0): 1.0 * 0.65 + 1.0 * 0.35 = 1.0
    // Low Z (clamped to 0.0): 1.0 * 0.65 + 0.0 * 0.35 = 0.65
    assert.strictEqual(result[0].dominanceIndex, 1.0);
    assert.strictEqual(result[1].dominanceIndex, 0.65);
  });

  test('should sort results by dominance index in descending order', () => {
    const input = [
      {
        source_module: 'module1',
        efficiency_coefficient: 0.5,
        domain_kpis: { zscore: 0 }, // DI = 0.5 * 0.65 + 0.5 * 0.35 = 0.325 + 0.175 = 0.5
        signal_status: 'ok',
        system_timestamp: 1
      },
      {
        source_module: 'module2',
        efficiency_coefficient: 0.9,
        domain_kpis: { zscore: 2 }, // normalizeZ(2) = (2+3)/6 = 5/6 = 0.8333...
        // DI = 0.9 * 0.65 + 0.8333... * 0.35 = 0.585 + 0.291666... = 0.87666...
        // Rounding: 0.8767
        signal_status: 'ok',
        system_timestamp: 2
      },
      {
        source_module: 'module3',
        efficiency_coefficient: 0.2,
        domain_kpis: { zscore: -2 }, // normalizeZ(-2) = (-2+3)/6 = 1/6 = 0.1666...
        // DI = 0.2 * 0.65 + 0.1666... * 0.35 = 0.13 + 0.058333... = 0.188333...
        // Rounding: 0.1883
        signal_status: 'ok',
        system_timestamp: 3
      }
    ];

    const result = zScoreBoard(input);
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].dominanceIndex > result[1].dominanceIndex, true);
    assert.strictEqual(result[1].dominanceIndex > result[2].dominanceIndex, true);
    assert.strictEqual(result[0].dominanceIndex, 0.8767);
    assert.strictEqual(result[2].dominanceIndex, 0.1883);
  });
});
