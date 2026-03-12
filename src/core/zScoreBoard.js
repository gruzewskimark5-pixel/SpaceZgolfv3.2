const normalizeZ = (z) => Math.max(0, Math.min(1, (z + 3) / 6));
// ⚡ Bolt: Optimize large array processing by pre-allocating an array and using
// a for loop instead of .map(). This prevents the V8 garbage collector from
// having to handle multiple intermediate allocations while still preserving
// immutability of the source objects and array.
export const zScoreBoard = (vitalsArray) => {
  const len = vitalsArray.length;
  const result = new Array(len);
  for (let i = 0; i < len; i++) {
    const v = vitalsArray[i];
    const dominanceIndex = Number((v.efficiency_coefficient * 0.65 + normalizeZ(v.domain_kpis.zscore) * 0.35).toFixed(4));
    result[i] = {
      module: v.source_module.includes('golf') ? 'SPACEZGOLF' : 'BLUE HORIZON',
      ec: v.efficiency_coefficient,
      z: v.domain_kpis.zscore,
      dominanceIndex,
      signal: v.signal_status,
      timestamp: v.system_timestamp
    };
  }
  return result.sort((a, b) => b.dominanceIndex - a.dominanceIndex);
};
