export const EventBus = (() => {
  const listeners = new Map();
  return {
    on(event, fn) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(fn); return () => listeners.get(event)?.delete(fn); },
    emit(event, data) { if (!listeners.has(event)) return; [...listeners.get(event)].forEach(fn => { try { fn(data); } catch(e) { console.error(`[EventBus]`, e); } }); },
    off(event, fn) { listeners.get(event)?.delete(fn); }
  };
})();
