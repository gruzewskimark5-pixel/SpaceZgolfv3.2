import { EventBus } from '../core/EventBus.js';
const $ = id => document.getElementById(id);
const sigClass = s => s === 'green' ? 'lb-signal-green' : s === 'yellow' ? 'lb-signal-yellow' : 'lb-signal-red';
const render = (lb) => {
  const top = lb[0]; if (!top) return;
  $('dominance-module').textContent = top.module;
  $('dominance-index').textContent = top.dominanceIndex.toFixed(4);
  $('leaderboard-rows').innerHTML = lb.map((r, i) => `<div class="lb-row"><span class="lb-rank">#${i+1}</span><span class="lb-module">${r.module}</span><span class="lb-di">${r.dominanceIndex.toFixed(4)}</span><span class="${sigClass(r.signal)}">● ${(r.signal||'').toUpperCase()}</span></div>`).join('');
  $('last-update').textContent = `LAST UPDATE: ${new Date().toLocaleTimeString()} // v3.2`;
};
export const initScorecard = () => EventBus.on('leaderboard:updated', render);
