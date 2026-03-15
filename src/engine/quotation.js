/**
 * quotation.js — V2: Full quotation orchestrator.
 * Adds: Margen de Ganancia, IVA, separated cost categories,
 * uses unidades_por_paquete from DB for ream calculation.
 */

import { evaluateAllMachines } from './imposition.js';
import {
  calculatePaperCost,
  calculatePlateCost,
  calculateProcessCost,
  getMachines,
} from './pricing.js';

/** Default profit margin and tax */
const DEFAULT_MARGIN_PERCENT = 30;
const IVA_PERCENT = 19;

/**
 * Generate a full quotation.
 */
export function generateQuotation(allData, params) {
  const {
    productType,
    quantity,
    pieceWidth,
    pieceHeight,
    interiorPages = 0,
    interiorPaperCost = 0,
    interiorUnitsPerPackage = 500,
    coverPaperCost = 0,
    coverUnitsPerPackage = 100,
    numColors = 4,
    hasLamination = false,
    hasBinding = false,
    bindingType = 'Anillado',
    mermaPercent = 10,
    marginPercent = DEFAULT_MARGIN_PERCENT,
  } = params;

  const machines = getMachines(allData);
  const isEditorial = productType === 'Libro' || productType === 'Agenda';

  const breakdown = {
    productType,
    quantity,
    dimensions: `${pieceWidth} × ${pieceHeight} cm`,
    interior: null,
    cover: null,
    finishing: {},
    costoPapel: 0,
    costoProcesos: 0,
    costoProduccion: 0,
    margenGanancia: 0,
    subtotalConMargen: 0,
    iva: 0,
    totalCost: 0,
    costPerUnit: 0,
  };

  // ── INTERIOR (editorial) or single pass (flyer) ───────────────
  {
    const rankings = evaluateAllMachines(pieceWidth, pieceHeight, machines);
    if (rankings.length === 0) {
      breakdown.error = 'La pieza no cabe en ninguna máquina disponible.';
      return breakdown;
    }

    const best = rankings[0];

    let totalPressSheets;
    if (isEditorial) {
      const totalPageSides = interiorPages * quantity;
      const pageSidesPerSheet = best.imposition.piecesPerSheet * 2;
      totalPressSheets = Math.ceil(totalPageSides / pageSidesPerSheet);
    } else {
      totalPressSheets = Math.ceil(quantity / best.imposition.piecesPerSheet);
    }

    // Paper cost using unidades_por_paquete from the selected supply
    const paperResult = calculatePaperCost(
      totalPressSheets * best.imposition.piecesPerSheet,
      best.imposition.piecesPerSheet,
      interiorPaperCost || 25000,
      interiorUnitsPerPackage,
      mermaPercent
    );

    const plates = calculatePlateCost(allData, numColors, quantity);
    const cutting = calculateProcessCost(allData, 'Corte', quantity);

    breakdown.interior = {
      machine: best.machine.nombre,
      piecesPerSheet: best.imposition.piecesPerSheet,
      orientation: best.imposition.orientation,
      layout: `${best.imposition.cols} × ${best.imposition.rows}`,
      wastePercent: best.imposition.wastePercent,
      render: best.imposition.render,
      sheetsNeeded: paperResult.sheetsNeeded,
      sheetsWithMerma: paperResult.sheetsWithMerma,
      packages: paperResult.packages,
      unitsPerPackage: paperResult.unitsPerPackage,
      paperCost: paperResult.cost,
      platesCost: plates.totalCost,
      platesDetail: `${plates.platesNeeded} planchas × $${plates.unitCost.toLocaleString()}`,
      cuttingCost: cutting.totalCost,
      subtotal: paperResult.cost + plates.totalCost + cutting.totalCost,
      allMachineOptions: rankings.map((r) => ({
        machine: r.machine.nombre,
        piecesPerSheet: r.imposition.piecesPerSheet,
        waste: r.imposition.wastePercent,
        orientation: r.imposition.orientation,
        render: r.imposition.render,
      })),
    };

    if (isEditorial) {
      breakdown.interior.interiorPages = interiorPages;
      breakdown.interior.totalPressSheets = totalPressSheets;
    }

    breakdown.costoPapel += paperResult.cost;
    breakdown.costoProcesos += plates.totalCost + cutting.totalCost;
  }

  // ── TAPA / COVER (editorial only) ────────────────────────────
  if (isEditorial) {
    const coverRankings = evaluateAllMachines(pieceWidth, pieceHeight, machines);

    if (coverRankings.length > 0) {
      const bestCover = coverRankings[0];
      const coverSheets = calculatePaperCost(
        quantity,
        bestCover.imposition.piecesPerSheet,
        coverPaperCost || 55000,
        coverUnitsPerPackage,
        mermaPercent
      );
      const coverPlates = calculatePlateCost(allData, numColors, quantity);

      let laminationCost = { totalCost: 0, unitCost: 0 };
      if (hasLamination) {
        laminationCost = calculateProcessCost(allData, 'Laminado', quantity);
      }

      breakdown.cover = {
        machine: bestCover.machine.nombre,
        piecesPerSheet: bestCover.imposition.piecesPerSheet,
        orientation: bestCover.imposition.orientation,
        layout: `${bestCover.imposition.cols} × ${bestCover.imposition.rows}`,
        wastePercent: bestCover.imposition.wastePercent,
        render: bestCover.imposition.render,
        sheetsNeeded: coverSheets.sheetsNeeded,
        sheetsWithMerma: coverSheets.sheetsWithMerma,
        packages: coverSheets.packages,
        unitsPerPackage: coverSheets.unitsPerPackage,
        paperCost: coverSheets.cost,
        platesCost: coverPlates.totalCost,
        laminationCost: laminationCost.totalCost,
        subtotal: coverSheets.cost + coverPlates.totalCost + laminationCost.totalCost,
      };

      breakdown.costoPapel += coverSheets.cost;
      breakdown.costoProcesos += coverPlates.totalCost + laminationCost.totalCost;
    }
  }

  // ── FINISHING (binding) ──────────────────────────────────────
  if (hasBinding && isEditorial) {
    const binding = calculateProcessCost(allData, bindingType, quantity);
    breakdown.finishing.binding = {
      type: bindingType,
      unitCost: binding.unitCost,
      totalCost: binding.totalCost,
    };
    breakdown.costoProcesos += binding.totalCost;
  }

  // ── COST SUMMARY (Producción + Margen + IVA) ─────────────────
  breakdown.costoProduccion = breakdown.costoPapel + breakdown.costoProcesos;
  breakdown.margenGanancia = Math.round(breakdown.costoProduccion * (marginPercent / 100));
  breakdown.subtotalConMargen = breakdown.costoProduccion + breakdown.margenGanancia;
  breakdown.iva = Math.round(breakdown.subtotalConMargen * (IVA_PERCENT / 100));
  breakdown.totalCost = breakdown.subtotalConMargen + breakdown.iva;
  breakdown.costPerUnit = Math.round(breakdown.totalCost / quantity);
  breakdown.marginPercent = marginPercent;
  breakdown.ivaPercent = IVA_PERCENT;

  return breakdown;
}
