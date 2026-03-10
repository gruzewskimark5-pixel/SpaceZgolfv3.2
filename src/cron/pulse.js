import { EventBus } from '../core/EventBus.js';
import { zScoreBoard } from '../core/zScoreBoard.js';
let intervalId = null;
const mock = () => [
  { source_module: 'golf_engine', efficiency_coefficient: Number((0.7 + Math.random() * 0.3).toFixed(2)), domain_kpis: { zscore: Number((Math.random() * 4 - 2).toFixed(2)) }, signal_status: Math.random() > 0.3 ? 'green' : 'yellow', system_timestamp: Date.now() },
  { source_module: 'blue_horizon_re', efficiency_coefficient: Number((0.85 + Math.random() * 0.1).toFixed(2)), domain_kpis: { zscore: Number((Math.random() * 2 - 1).toFixed(2)) }, signal_status: 'green', system_timestamp: Date.now() }
];
const fetchAPI = async () => { try { const r = await fetch('/api/leaderboard'); if (!r.ok) throw new Error(); const d = await r.json(); return d.length ? d.map(row => ({ source_module: row.module === 'SPACEZGOLF' ? 'golf_engine' : 'blue_horizon_re', efficiency_coefficient: row.efficiency, domain_kpis: { zscore: row.zscore }, signal_status: row.signal, system_timestamp: row.timestamp || Date.now() })) : null; } catch { return null; } };
export const startPulse = (ms = 60000) => {
  if (intervalId) clearInterval(intervalId);
  const tick = async () => { const data = await fetchAPI() || mock(); const lb = zScoreBoard(data); EventBus.emit('leaderboard:updated', lb); };
  tick(); intervalId = setInterval(tick, ms);
};
