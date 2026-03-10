export const normalizeZ = z => Math.max(0, Math.min(1, (z + 3) / 6));
export const calcDI = (ec, z) => Number((Number(ec) * 0.65 + normalizeZ(Number(z)) * 0.35).toFixed(4));
