const normalizeZ = (z) => Math.max(0, Math.min(1, (z + 3) / 6));
export const zScoreBoard = (vitalsArray) => vitalsArray.map(v => {
  const dominanceIndex = Number((v.efficiency_coefficient * 0.65 + normalizeZ(v.domain_kpis.zscore) * 0.35).toFixed(4));
  return { module: v.source_module.includes('golf') ? 'SPACEZGOLF' : 'BLUE HORIZON', ec: v.efficiency_coefficient, z: v.domain_kpis.zscore, dominanceIndex, signal: v.signal_status, timestamp: v.system_timestamp };
}).sort((a, b) => b.dominanceIndex - a.dominanceIndex);
