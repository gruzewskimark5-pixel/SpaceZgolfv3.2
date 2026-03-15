const { performance } = require('perf_hooks');

const data = [];
for (let i = 0; i < 1000; i++) {
  data.push({
    module: i % 2 === 0 ? 'SPACEZGOLF' : 'BLUE HORIZON',
    dominanceIndex: Math.random(),
    efficiency: Math.random(),
    zscore: Math.random(),
    signal: 'active',
    timestamp: new Date().toISOString(),
    rank: i + 1
  });
}

const jsonString = JSON.stringify(data);

function testResJson() {
  let result;
  const res = { json: (obj) => { result = JSON.stringify(obj); } };
  res.json(data);
}

function testResSend() {
  let result;
  const res = { setHeader: () => {}, send: (str) => { result = str; } };
  res.setHeader('Content-Type', 'application/json');
  res.send(jsonString);
}

// Warmup
for (let i = 0; i < 10000; i++) {
  testResJson();
  testResSend();
}

const iterations = 50000;

const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
  testResJson();
}
const end1 = performance.now();
console.log(`res.json() (object cache): ${end1 - start1} ms`);

const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
  testResSend();
}
const end2 = performance.now();
console.log(`res.send() (string cache): ${end2 - start2} ms`);
