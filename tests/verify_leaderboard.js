
const normalizeZ = z => Math.max(0, Math.min(1, (z + 3) / 6));
const calcDI = (ec, z) => Number((Number(ec) * 0.65 + normalizeZ(Number(z)) * 0.35).toFixed(4));

function processLeaderboard(rows) {
  const data = rows.map(r => ({
    module: r.source_module?.includes('golf') ? 'SPACEZGOLF' : 'BLUE HORIZON',
    dominanceIndex: calcDI(r.efficiency_coefficient, r.zscore),
    efficiency: Number(r.efficiency_coefficient),
    zscore: Number(r.zscore),
    signal: r.signal_status,
    timestamp: r.system_timestamp
  }));

  data.sort((a, b) => b.dominanceIndex - a.dominanceIndex);
  for (let i = 0; i < data.length; i++) data[i].rank = i + 1;
  return data;
}

const mockRows = [
  { source_module: 'golf-1', efficiency_coefficient: 0.8, zscore: 1, signal_status: 'OK', system_timestamp: '2023-01-01' },
  { source_module: 'bh-1', efficiency_coefficient: 0.9, zscore: 0, signal_status: 'OK', system_timestamp: '2023-01-02' },
  { source_module: 'golf-2', efficiency_coefficient: 0.7, zscore: 2, signal_status: 'WARN', system_timestamp: '2023-01-03' }
];

const processed = processLeaderboard(mockRows);

console.log('Processed Data:', JSON.stringify(processed, null, 2));

// Basic assertions
if (processed.length !== 3) throw new Error('Length mismatch');
if (processed[0].dominanceIndex < processed[1].dominanceIndex) throw new Error('Sorting failed');
if (processed[1].dominanceIndex < processed[2].dominanceIndex) throw new Error('Sorting failed');
if (processed[0].rank !== 1 || processed[1].rank !== 2 || processed[2].rank !== 3) throw new Error('Ranking failed');

processed.forEach(r => {
  if (typeof r.module !== 'string') throw new Error('Module type error');
  if (typeof r.dominanceIndex !== 'number') throw new Error('DominanceIndex type error');
  if (typeof r.rank !== 'number') throw new Error('Rank type error');
});

console.log('Verification test passed!');
