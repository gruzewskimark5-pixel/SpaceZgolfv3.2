import { EventBus } from '../core/EventBus.js';
// ⚡ Bolt: Cache DOM elements to prevent expensive document.getElementById queries on every render
let els = null;
const initEls = () => {
  if (!els) {
    els = {
      module: document.getElementById('dominance-module'),
      index: document.getElementById('dominance-index'),
      rows: document.getElementById('leaderboard-rows'),
      update: document.getElementById('last-update')
    };
  }
};
const sigClass = s => s === 'green' ? 'lb-signal-green' : s === 'yellow' ? 'lb-signal-yellow' : 'lb-signal-red';
const render = (lb) => {
  const top = lb[0]; if (!top) return;
  initEls();
  els.module.textContent = top.module;
  els.index.textContent = top.dominanceIndex.toFixed(4);

  // ⚡ Bolt: Prevent unnecessary DOM layout/paint thrashing by only updating innerHTML if changed
  const newHtml = lb.map((r, i) => `<div class="lb-row"><span class="lb-rank">#${i+1}</span><span class="lb-module">${r.module}</span><span class="lb-di">${r.dominanceIndex.toFixed(4)}</span><span class="${sigClass(r.signal)}">● ${(r.signal||'').toUpperCase()}</span></div>`).join('');
  if (els.rows.innerHTML !== newHtml) {
    els.rows.innerHTML = newHtml;
  }

  els.update.textContent = `LAST UPDATE: ${new Date().toLocaleTimeString()} // v3.2`;
};
export const initScorecard = () => EventBus.on('leaderboard:updated', render);
