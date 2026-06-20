import { EventBus } from '../core/EventBus.js';
import { zScoreBoard } from '../core/zScoreBoard.js';
import { StateStore } from '../core/StateStore.js';

let intervalId = null;
// ⚡ Bolt: Cache ETag to avoid redundant processing on API polling
let lastETag = null;

const mock = () => {
  // ⚡ Bolt: Cache system timestamp to avoid redundant Date.now() calls
  const now = Date.now();
  return {
    type: 'mock',
    data: [
      {
        source_module: 'golf_engine',
        // ⚡ Bolt: Use Math.round instead of Number(...toFixed(2)) to prevent expensive string allocations
        efficiency_coefficient: Math.round((0.7 + Math.random() * 0.3) * 100) / 100,
        domain_kpis: { zscore: Math.round((Math.random() * 4 - 2) * 100) / 100 },
        signal_status: Math.random() > 0.3 ? 'green' : 'yellow',
        system_timestamp: now
      },
      {
        source_module: 'blue_horizon_re',
        efficiency_coefficient: Math.round((0.85 + Math.random() * 0.1) * 100) / 100,
        domain_kpis: { zscore: Math.round((Math.random() * 2 - 1) * 100) / 100 },
        signal_status: 'green',
        system_timestamp: now
      }
    ]
  };
};

const fetchAPI = async () => {
  try {
    const headers = {};
    if (lastETag) {
      headers['If-None-Match'] = lastETag;
    }
    const r = await fetch('/api/leaderboard', { headers });

    // ⚡ Bolt: Short-circuit on 304 Not Modified
    if (r.status === 304) {
      return { type: '304' };
    }

    if (!r.ok) {
      throw new Error();
    }

    // ⚡ Bolt: Capture ETag for future requests
    const etag = r.headers.get('ETag') || r.headers.get('etag');
    if (etag) {
      lastETag = etag;
    }

    const d = await r.json();
    if (!d.length) {
      return null;
    }

    // ⚡ Bolt: Return the pre-computed, pre-sorted API data directly
    // instead of mapping it back to a raw format and redundantly recalculating
    return { type: 'api', data: d };
  } catch {
    return null;
  }
};

export const startPulse = (ms = 60000) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  const tick = async () => {
    const payload = (await fetchAPI()) || mock();

    // ⚡ Bolt: Skip processing and DOM re-renders if the payload hasn't changed
    if (payload && payload.type === '304') return;

    const lb = payload.type === 'api' ? payload.data : zScoreBoard(payload.data);
    StateStore.set({
      leaderboard: lb,
      lastPulse: Date.now()
    });
    EventBus.emit('leaderboard:updated', lb);
  };
  tick();
  intervalId = setInterval(tick, ms);
};
