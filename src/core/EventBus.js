export const EventBus = (() => {
  const listeners = new Map();
  return {
    // ⚡ Bolt: Use Array instead of Set for event listeners. While Set offers O(1)
    // addition/deletion, iterating it via for...of in emit() creates significant GC
    // and iteration overhead compared to a standard Array with a for-loop.
    on(event, fn) { let fns = listeners.get(event); if (!fns) { fns = []; listeners.set(event, fns); } if (!fns.includes(fn)) fns.push(fn); return () => { const i = fns.indexOf(fn); if (i !== -1) fns.splice(i, 1); }; },
    // ⚡ Bolt: Removed redundant Map.has() lookup. Direct Map.get() cuts hash map queries in half.
    // ⚡ Bolt: Create a fast shallow copy using .slice() to ensure safe iteration
    // when listeners unsubscribe during emit, then iterate with a standard for-loop to minimize overhead.
    emit(event, data) { const fns = listeners.get(event); if (!fns) return; const snapshot = fns.slice(); const len = snapshot.length; for (let i = 0; i < len; i++) { try { snapshot[i](data); } catch(e) { console.error(`[EventBus]`, e); } } },
    off(event, fn) { const fns = listeners.get(event); if (fns) { const i = fns.indexOf(fn); if (i !== -1) fns.splice(i, 1); } }
  };
})();
