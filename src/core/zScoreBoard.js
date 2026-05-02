export const normalizeZ = (z) => Math.max(0, Math.min(1, (z + 3) / 6));

// ⚡ Bolt: Use Math.round instead of Number((...).toFixed(4)) to avoid expensive string allocations and conversions in loops
export const calcDI = (ec, z) => Math.round((ec * 0.65 + normalizeZ(z) * 0.35) * 10000) / 10000;

// ⚡ Bolt: Optimize large array processing by pre-allocating an array and using
// a for loop instead of .map(). This prevents the V8 garbage collector from
// having to handle multiple intermediate allocations while still preserving
// immutability of the source objects and array.
export const zScoreBoard = (vitalsArray) => {
  const len = vitalsArray.length;
  const result = new Array(len);
  for (let i = 0; i < len; i++) {
    const v = vitalsArray[i];
    const ec = v.efficiency_coefficient;
    const z = v.domain_kpis.zscore;
    // ⚡ Bolt: Inline mathematical calculations inside the hot loop to completely avoid
    // the V8 overhead of calling external helper functions (calcDI and normalizeZ).
    const normZ = z <= -3 ? 0 : (z >= 3 ? 1 : (z + 3) / 6);
    const dominanceIndex = Math.round((ec * 0.65 + normZ * 0.35) * 10000) / 10000;

    result[i] = {
      module: v.source_module.includes('golf') ? 'SPACEZGOLF' : 'BLUE HORIZON',
      ec,
      z,
      dominanceIndex,
      signal: v.signal_status,
      timestamp: v.system_timestamp
    };
  }
  return result.sort((a, b) => b.dominanceIndex - a.dominanceIndex);
};
