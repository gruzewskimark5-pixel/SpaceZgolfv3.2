export const EventBus = (() => {
  const listeners = new Map();
  return {
    on(event, fn) { let fns = listeners.get(event); if (!fns) { fns = new Set(); listeners.set(event, fns); } fns.add(fn); return () => fns.delete(fn); },
    // ⚡ Bolt: Removed redundant Map.has() lookup. Direct Map.get() cuts hash map queries in half.
    emit(event, data) { const fns = listeners.get(event); if (!fns) return; for (const fn of fns) { try { fn(data); } catch(e) { console.error(`[EventBus]`, e); } } },
    off(event, fn) { listeners.get(event)?.delete(fn); }
    on(event, fn) {
      // ⚡ Bolt: Use a single get() to halve hash map lookup overhead
      let fns = listeners.get(event);
      if (!fns) {
        fns = new Set();
        listeners.set(event, fns);
      }
      fns.add(fn);
      return () => {
        const currentFns = listeners.get(event);
        if (currentFns) {
          currentFns.delete(fn);
        }
      };
    },
    emit(event, data) {
      // ⚡ Bolt: Optimize hot path with a single get() check
      const fns = listeners.get(event);
      if (!fns) {
        return;
      }
      for (const fn of fns) {
        try {
          fn(data);
        } catch(e) {
          console.error(`[EventBus]`, e);
        }
      }
    },
    off(event, fn) {
      listeners.get(event)?.delete(fn);
      const currentFns = listeners.get(event);
      if (currentFns) {
        currentFns.delete(fn);
      }
    }
  };
})();
