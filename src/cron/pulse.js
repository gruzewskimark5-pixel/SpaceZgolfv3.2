import { EventBus } from '../core/EventBus.js';
import { zScoreBoard } from '../core/zScoreBoard.js';
import { StateStore } from '../core/StateStore.js';

let intervalId = null;

// ⚡ Bolt: Cache system timestamp to avoid redundant Date.now() calls
// ⚡ Bolt: Use Math.round for precision rounding to avoid heavy string allocation and GC overhead of .toFixed()
const mock = () => {
  const now = Date.now();
  return {
    type: 'mock',
    data: [
      {
        source_module: 'golf_engine',
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
    const r = await fetch('/api/leaderboard');
    if (!r.ok) {
      throw new Error();
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
