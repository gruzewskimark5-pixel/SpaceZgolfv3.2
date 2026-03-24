import { performance } from 'perf_hooks';

// Setup Mock Data
const len = 10000;
const rawData = [];
for (let i = 0; i < len; i++) {
  rawData.push({
    source_module: i % 2 === 0 ? 'SPACEZGOLF' : 'BLUE HORIZON',
    efficiency: Math.random(),
    zscore: Math.random() * 6 - 3,
    signal: 'green',
    timestamp: Date.now()
  });
}

function sigClass(s) {
  return s === 'green' ? 'lb-signal-green' : s === 'yellow' ? 'lb-signal-yellow' : 'lb-signal-red';
}

function testOriginal() {
  const lb = rawData;
  const len = lb.length;
  const parts = new Array(len);
  for (let i = 0; i < len; i++) {
    const r = lb[i];
    parts[i] = `<div class="lb-row"><span class="lb-rank">#${i + 1}</span><span class="lb-module">${r.source_module}</span><span class="lb-di">${(r.efficiency).toFixed(4)}</span><span class="${sigClass(r.signal)}">● ${(r.signal || '').toUpperCase()}</span></div>`;
  }
  return parts.join('');
}

function testOptimized() {
  const lb = rawData;
  const len = lb.length;
  let str = '';
  for (let i = 0; i < len; i++) {
    const r = lb[i];
    str += `<div class="lb-row"><span class="lb-rank">#${i + 1}</span><span class="lb-module">${r.source_module}</span><span class="lb-di">${(r.efficiency).toFixed(4)}</span><span class="${sigClass(r.signal)}">● ${(r.signal || '').toUpperCase()}</span></div>`;
  }
  return str;
}


// Warmup
for (let i=0; i<100; i++) {
  testOriginal();
  testOptimized();
}

const iters = 100;

let start = performance.now();
for (let i = 0; i < iters; i++) {
  testOriginal();
}
const timeOriginal = performance.now() - start;

start = performance.now();
for (let i = 0; i < iters; i++) {
  testOptimized();
}
const timeOptimized = performance.now() - start;

console.log(`UI Original: ${timeOriginal.toFixed(2)}ms`);
console.log(`UI Optimized: ${timeOptimized.toFixed(2)}ms`);
