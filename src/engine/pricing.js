/**
 * pricing.js — V2: Volume pricing lookup + paper/plate cost calculators.
 * Adapted for Firebase `allData` object instead of SQLite.
 */

const DEFAULT_MERMA_PERCENT = 10;

/**
 * Look up the batch cost for a process at a given quantity.
 * Finds the highest defined tier that is <= quantity.
 */
export function lookupVolumePrice(allData, processName, quantity) {
  const candidates = allData.pricing
    .filter(p => p.proceso === processName && quantity >= p.cantidad_minima)
    .sort((a, b) => b.cantidad_minima - a.cantidad_minima);

  return candidates.length > 0 ? candidates[0].valor_aplicado : null;
}

/**
 * Calculate paper cost using unidades_por_paquete from the supply record.
 */
export function calculatePaperCost(totalPieces, piecesPerSheet, costPerPackage, unitsPerPackage = 500, mermaPercent = DEFAULT_MERMA_PERCENT) {
  const sheetsNeeded = Math.ceil(totalPieces / piecesPerSheet);
  const sheetsWithMerma = Math.ceil(sheetsNeeded * (1 + mermaPercent / 100));
  const packages = Math.ceil(sheetsWithMerma / unitsPerPackage);
  const cost = packages * costPerPackage;

  return {
    sheetsNeeded,
    sheetsWithMerma,
    packages,
    unitsPerPackage,
    cost,
  };
}

/**
 * Calculate plate cost for a job.
 */
export function calculatePlateCost(allData, numColors, quantity) {
  const unitCost = lookupVolumePrice(allData, 'Planchas', quantity) || 0;
  return {
    platesNeeded: numColors,
    unitCost,
    totalCost: numColors * unitCost,
  };
}

/**
 * Look up the total batch cost for a process at the given quantity tier.
 * valor_aplicado is the TOTAL cost for that batch (not per unit).
 */
export function calculateProcessCost(allData, processName, quantity) {
  const batchCost = lookupVolumePrice(allData, processName, quantity) || 0;
  return {
    unitCost: quantity > 0 ? Math.round(batchCost / quantity) : 0,
    totalCost: batchCost,
  };
}

/**
 * Get all supplies from the data, optionally filtered by type.
 */
export function getSupplies(allData, tipoInsumo) {
  let supplies = allData.supplies || [];
  if (tipoInsumo) {
    supplies = supplies.filter(s => s.tipo_insumo === tipoInsumo);
  }
  return supplies;
}

/**
 * Get all machines from the data.
 */
export function getMachines(allData) {
  return allData.machines || [];
}
