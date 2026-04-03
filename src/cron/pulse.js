import { EventBus } from '../core/EventBus.js';
import { zScoreBoard } from '../core/zScoreBoard.js';
import { StateStore } from '../core/StateStore.js';

let intervalId = null;

const mock = () => ({
  type: 'mock',
  data: [
    {
      source_module: 'golf_engine',
      efficiency_coefficient: Number((0.7 + Math.random() * 0.3).toFixed(2)),
      domain_kpis: { zscore: Number((Math.random() * 4 - 2).toFixed(2)) },
      signal_status: Math.random() > 0.3 ? 'green' : 'yellow',
      system_timestamp: Date.now()
    },
    {
      source_module: 'blue_horizon_re',
      efficiency_coefficient: Number((0.85 + Math.random() * 0.1).toFixed(2)),
      domain_kpis: { zscore: Number((Math.random() * 2 - 1).toFixed(2)) },
      signal_status: 'green',
      system_timestamp: Date.now()
    }
  ]
});

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
