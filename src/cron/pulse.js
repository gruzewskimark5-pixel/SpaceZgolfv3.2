import { EventBus } from '../core/EventBus.js';
import { zScoreBoard } from '../core/zScoreBoard.js';
import { StateStore } from '../core/StateStore.js';
let intervalId = null;
const mock = () => [
  { source_module: 'golf_engine', efficiency_coefficient: Number((0.7 + Math.random() * 0.3).toFixed(2)), domain_kpis: { zscore: Number((Math.random() * 4 - 2).toFixed(2)) }, signal_status: Math.random() > 0.3 ? 'green' : 'yellow', system_timestamp: Date.now() },
  { source_module: 'blue_horizon_re', efficiency_coefficient: Number((0.85 + Math.random() * 0.1).toFixed(2)), domain_kpis: { zscore: Number((Math.random() * 2 - 1).toFixed(2)) }, signal_status: 'green', system_timestamp: Date.now() }
];
const fetchAPI = async () => { try { const r = await fetch('/api/leaderboard'); if (!r.ok) throw new Error(); const d = await r.json(); return d.length ? d : null; } catch { return null; } };
export const startPulse = (ms = 60000) => {
  if (intervalId) clearInterval(intervalId);
  const tick = async () => {
    const apiData = await fetchAPI();
    // ⚡ Bolt: Use pre-computed API data directly instead of reverse-mapping and recalculating
    const lb = apiData ? apiData.map(r => ({ module: r.module, ec: r.efficiency, z: r.zscore, dominanceIndex: r.dominanceIndex, signal: r.signal, timestamp: r.timestamp })) : zScoreBoard(mock());
    StateStore.set({ leaderboard: lb, lastPulse: Date.now() });
    EventBus.emit('leaderboard:updated', lb);
  };
  tick(); intervalId = setInterval(tick, ms);
};
