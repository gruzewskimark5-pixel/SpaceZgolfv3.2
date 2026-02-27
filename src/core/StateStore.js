import { EventBus } from './EventBus.js';
export const StateStore = (() => {
  let state = Object.freeze({ leaderboard: [], lastPulse: null, status: 'initializing' });
  return {
    get() { return state; },
    set(patch) { state = Object.freeze({ ...state, ...patch }); EventBus.emit('state:updated', state); }
  };
})();
