/**
 * pricing.js — V2: Volume pricing lookup + paper/plate cost calculators.
 * Adapted for Firebase `allData` object instead of SQLite.
 */

const DEFAULT_MERMA_PERCENT = 10;

/**
 * Look up the unit price for a process at a given quantity from allData.
 */
export function lookupVolumePrice(allData, processName, quantity) {
  const processDef = allData.processes.find(p => p.nombre === processName);
  if (!processDef) return null;

  const validRanges = allData.pricing.filter(p => 
    p.id_proceso === processDef.id &&
    quantity >= p.cantidad_minima &&
    quantity <= p.cantidad_maxima
  );

  if (validRanges.length > 0) {
    return validRanges[0].valor_aplicado;
  }
  return null;
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
 * Calculate a finishing process cost.
 */
export function calculateProcessCost(allData, processName, quantity) {
  const unitCost = lookupVolumePrice(allData, processName, quantity) || 0;
  return {
    unitCost,
    totalCost: quantity * unitCost,
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
