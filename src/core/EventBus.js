export const EventBus = (() => {
  const listeners = new Map();
  return {
    on(event, fn) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(fn); return () => listeners.get(event)?.delete(fn); },
    emit(event, data) { if (!listeners.has(event)) return; for (const fn of listeners.get(event)) { try { fn(data); } catch(e) { console.error(`[EventBus]`, e); } } },
    off(event, fn) { listeners.get(event)?.delete(fn); }
  };
})();
