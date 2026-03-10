
const normalizeZ = z => Math.max(0, Math.min(1, (z + 3) / 6));
const calcDI = (ec, z) => Number((Number(ec) * 0.65 + normalizeZ(Number(z)) * 0.35).toFixed(4));

function original(rows) {
  return rows.map(r => ({
    module: r.source_module?.includes('golf') ? 'SPACEZGOLF' : 'BLUE HORIZON',
    dominanceIndex: calcDI(r.efficiency_coefficient, r.zscore),
    efficiency: Number(r.efficiency_coefficient),
    zscore: Number(r.zscore),
    signal: r.signal_status,
    timestamp: r.system_timestamp
  }))
  .sort((a, b) => b.dominanceIndex - a.dominanceIndex)
  .map((r, i) => ({ ...r, rank: i + 1 }));
}

function optimized(rows) {
  const data = rows.map(r => ({
    module: r.source_module?.includes('golf') ? 'SPACEZGOLF' : 'BLUE HORIZON',
    dominanceIndex: calcDI(r.efficiency_coefficient, r.zscore),
    efficiency: Number(r.efficiency_coefficient),
    zscore: Number(r.zscore),
    signal: r.signal_status,
    timestamp: r.system_timestamp
  }));

  data.sort((a, b) => b.dominanceIndex - a.dominanceIndex);

  for (let i = 0; i < data.length; i++) {
    data[i].rank = i + 1;
  }
  return data;
}

// Generate test data
const numRows = 10000;
const testRows = Array.from({ length: numRows }, (_, i) => ({
  source_module: i % 2 === 0 ? 'golf-module' : 'other-module',
  efficiency_coefficient: Math.random(),
  zscore: Math.random() * 6 - 3,
  signal_status: 'OK',
  system_timestamp: new Date().toISOString()
}));

function benchmark(fn, rows, iterations = 1000) {
  // Warm up
  for (let i = 0; i < 100; i++) fn(rows);

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn(rows);
  }
  const end = performance.now();
  return (end - start) / iterations;
}

console.log('Starting benchmark...');
const avgOriginal = benchmark(original, testRows);
console.log(`Original: ${avgOriginal.toFixed(4)}ms`);

const avgOptimized = benchmark(optimized, testRows);
console.log(`Optimized: ${avgOptimized.toFixed(4)}ms`);

const improvement = ((avgOriginal - avgOptimized) / avgOriginal) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}%`);
