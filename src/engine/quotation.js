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
  getSupplies,
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
    manualPiecesPerSheet = null,
  } = params;

  const machines = getMachines(allData);
  const isEditorial = productType === 'Libro' || productType === 'Agenda';
  const isAgenda    = productType === 'Agenda';
  const isTalonario = productType === 'Talonario';

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

  // ── Imposition (machine selection) — always runs ─────────────
  const rankings = evaluateAllMachines(pieceWidth, pieceHeight, machines);
  if (rankings.length === 0) {
    breakdown.error = 'La pieza no cabe en ninguna máquina disponible.';
    return breakdown;
  }
  const best = rankings[0];
  // Override piecesPerSheet if user provided a manual value
  const effectivePieces = manualPiecesPerSheet || best.imposition.piecesPerSheet;

  // ══════════════════════════════════════════════════════════════
  // RUTA A: AGENDA — costos batch desde la matriz Excel
  // ══════════════════════════════════════════════════════════════
  if (isAgenda) {
    const pc = (name) => calculateProcessCost(allData, name, quantity).totalCost;

    // Interior
    const impresionInterior = pc('Impresión Interior');
    const planchasInterior  = pc('Planchas');
    const corteInterior     = pc('Corte Interior');
    const anillo            = pc('Anillo');
    const anillado          = pc('Anillado');

    // Paper interior (calculado desde paquetes con las dimensiones reales)
    const totalPageSides     = interiorPages * quantity;
    const pageSidesPerSheet  = effectivePieces * 2;
    const totalPressSheets   = Math.ceil(totalPageSides / pageSidesPerSheet);
    const paperResult = calculatePaperCost(
      totalPressSheets,
      1,
      interiorPaperCost || 25000,
      interiorUnitsPerPackage,
      mermaPercent
    );

    breakdown.interior = {
      machine: best.machine.nombre,
      piecesPerSheet: effectivePieces,
      orientation: best.imposition.orientation,
      layout: manualPiecesPerSheet ? `Manual: ${manualPiecesPerSheet}` : `${best.imposition.cols} × ${best.imposition.rows}`,
      wastePercent: manualPiecesPerSheet ? '—' : best.imposition.wastePercent,
      render: manualPiecesPerSheet ? null : best.imposition.render,
      interiorPages,
      totalPressSheets,
      sheetsNeeded: paperResult.sheetsNeeded,
      sheetsWithMerma: paperResult.sheetsWithMerma,
      packages: paperResult.packages,
      unitsPerPackage: paperResult.unitsPerPackage,
      paperCost: paperResult.cost,
      impresionCost: impresionInterior,
      platesCost: planchasInterior,
      platesDetail: `Planchas lote`,
      cuttingCost: corteInterior,
      anilloCost: anillo,
      anilladoCost: anillado,
      subtotal: paperResult.cost + impresionInterior + planchasInterior + corteInterior + anillo + anillado,
      allMachineOptions: rankings.map((r) => ({
        machine: r.machine.nombre,
        piecesPerSheet: r.imposition.piecesPerSheet,
        waste: r.imposition.wastePercent,
        orientation: r.imposition.orientation,
        render: r.imposition.render,
      })),
    };
    breakdown.costoPapel    += paperResult.cost;
    breakdown.costoProcesos += impresionInterior + planchasInterior + corteInterior + anillo + anillado;

    // Tapa — Cartón Piedra con precio real por pliego
    const impresionTapa    = pc('Impresión Tapa');
    const polilaminadoTapa = pc('Polilaminado Tapa');
    const corteTapa        = pc('Corte Tapa');
    const manoObra         = pc('Mano de Obra');

    const cpSupply = getSupplies(allData, 'Cartón Piedra').find(s => s.unidades_por_paquete === 1);
    let cartonPiedra;
    let cpDetail;
    if (cpSupply && cpSupply.formato) {
      const [fw, fh] = cpSupply.formato.split('x').map(Number);
      const piezasPorPliego = Math.floor(fw / pieceWidth) * Math.floor(fh / pieceHeight);
      const pliegosBase     = Math.ceil(quantity / Math.max(piezasPorPliego, 1));
      const pliegosConMerma = Math.ceil(pliegosBase * (1 + mermaPercent / 100));
      cartonPiedra = pliegosConMerma * cpSupply.costo_paquete;
      cpDetail     = `${pliegosConMerma} pliegos × $${cpSupply.costo_paquete.toLocaleString()} (${cpSupply.formato})`;
    } else {
      cartonPiedra = pc('Cartón Piedra');
      cpDetail     = 'Precio desde matriz';
    }

    breakdown.cover = {
      machine: best.machine.nombre,
      piecesPerSheet: best.imposition.piecesPerSheet,
      orientation: best.imposition.orientation,
      layout: `${best.imposition.cols} × ${best.imposition.rows}`,
      wastePercent: best.imposition.wastePercent,
      paperCost: cartonPiedra,
      paperDetail: cpDetail,
      impresionCost: impresionTapa,
      polilaminadoCost: polilaminadoTapa,
      cuttingCost: corteTapa,
      manoObraCost: manoObra,
      laminationCost: 0,
      subtotal: impresionTapa + polilaminadoTapa + cartonPiedra + corteTapa + manoObra,
    };
    breakdown.costoPapel    += cartonPiedra;
    breakdown.costoProcesos += impresionTapa + polilaminadoTapa + corteTapa + manoObra;

    // Extras: papel espejo + intercalado
    const impEspejo  = pc('Impresión Papel Espejo');
    const papEspejo  = pc('Papel Espejo');
    const poliEspejo = pc('Polilaminado Espejo');
    const corEspejo  = pc('Corte Espejo');
    const impInter   = pc('Impresión Intercalado');
    const corInter   = pc('Corte Intercalado');

    breakdown.agenda_extras = {
      impresionEspejo: impEspejo,
      papelEspejo: papEspejo,
      polilaminadoEspejo: poliEspejo,
      corteEspejo: corEspejo,
      impresionIntercalado: impInter,
      corteIntercalado: corInter,
      subtotal: impEspejo + papEspejo + poliEspejo + corEspejo + impInter + corInter,
    };
    breakdown.costoPapel    += papEspejo;
    breakdown.costoProcesos += impEspejo + poliEspejo + corEspejo + impInter + corInter;

  // ══════════════════════════════════════════════════════════════
  // RUTA C: TALONARIO
  // ══════════════════════════════════════════════════════════════
  } else if (isTalonario) {
    const {
      juegosPerTalonario = 50,
      vias = [],
      terminaciones = {},
      mermaPercent: mp = 10,
    } = params;

    const hojasPerVia = quantity * juegosPerTalonario;

    // Imposition uses piece dimensions
    const coloresNombre =
      numColors === 1 ? 'Impresión Talonario 1 Color' :
      numColors === 2 ? 'Impresión Talonario 2 Colores' :
                        'Impresión Talonario Full Color';

    const impresionCost = calculateProcessCost(allData, coloresNombre,        quantity).totalCost;
    const alzadoCost    = calculateProcessCost(allData, 'Alzado Talonario',   quantity).totalCost;
    const planchasCost  = calculateProcessCost(allData, 'Planchas Talonario', quantity).totalCost;
    const corteCost     = calculateProcessCost(allData, 'Corte Talonario',    quantity).totalCost;

    // Per-vía breakdown
    const viasResult = vias.map((via, idx) => {
      const paperResult = calculatePaperCost(
        hojasPerVia,
        effectivePieces,
        via.papel?.costo_paquete    || 22000,
        via.papel?.unidades_por_paquete || 500,
        mp
      );
      breakdown.costoPapel += paperResult.cost;
      return {
        nombre:          via.nombre,
        papelNombre:     via.papel?.nombre_insumo || `Vía ${idx + 1}`,
        hojasPorVia:     hojasPerVia,
        pressSheets:     Math.ceil(hojasPerVia / effectivePieces),
        sheetsNeeded:    paperResult.sheetsNeeded,
        sheetsWithMerma: paperResult.sheetsWithMerma,
        packages:        paperResult.packages,
        unitsPerPackage: paperResult.unitsPerPackage,
        paperCost:       paperResult.cost,
      };
    });

    // Terminaciones
    const termKeys = {
      folio:          'Folio',
      prepicado:      'Prepicado',
      corcheteYCinta: 'Corchete y Cinta',
      engomado:       'Engomado',
      cartonBase:     'Cartón Base Talonario',
    };
    const termResult = {};
    for (const [key, procName] of Object.entries(termKeys)) {
      const active = terminaciones[key] || false;
      const cost   = active ? calculateProcessCost(allData, procName, quantity).totalCost : 0;
      termResult[key] = { active, cost, label: procName };
      if (active) breakdown.costoProcesos += cost;
    }

    breakdown.costoProcesos += impresionCost + alzadoCost + planchasCost + corteCost;

    breakdown.talonario = {
      juegosPerTalonario,
      numColors,
      machine:        best.machine.nombre,
      piecesPerSheet: effectivePieces,
      layout:         `${best.imposition.cols} × ${best.imposition.rows}`,
      wastePercent:   best.imposition.wastePercent,
      orientation:    best.imposition.orientation,
      render:         best.imposition.render,
      vias:           viasResult,
      impresionCost,
      planchasCost,
      corteCost,
      alzadoCost,
      terminaciones:  termResult,
    };

    breakdown.interior = {
      machine:        best.machine.nombre,
      piecesPerSheet: effectivePieces,
      layout:         manualPiecesPerSheet ? `Manual: ${manualPiecesPerSheet}` : `${best.imposition.cols} × ${best.imposition.rows}`,
      wastePercent:   manualPiecesPerSheet ? '—' : best.imposition.wastePercent,
      orientation:    best.imposition.orientation,
      render:         manualPiecesPerSheet ? null : best.imposition.render,
      allMachineOptions: rankings.map(r => ({
        machine:       r.machine.nombre,
        piecesPerSheet:r.imposition.piecesPerSheet,
        waste:         r.imposition.wastePercent,
        orientation:   r.imposition.orientation,
        render:        r.imposition.render,
      })),
    };

  // ══════════════════════════════════════════════════════════════
  // RUTA B: LIBRO / FLYER — lógica original
  // ══════════════════════════════════════════════════════════════
  } else {
    let totalPressSheets;
    if (isEditorial) {
      const totalPageSides = interiorPages * quantity;
      const pageSidesPerSheet = best.imposition.piecesPerSheet * 2;
      totalPressSheets = Math.ceil(totalPageSides / pageSidesPerSheet);
    } else {
      totalPressSheets = Math.ceil(quantity / best.imposition.piecesPerSheet);
    }

    const paperResult = calculatePaperCost(
      totalPressSheets * best.imposition.piecesPerSheet,
      best.imposition.piecesPerSheet,
      interiorPaperCost || 25000,
      interiorUnitsPerPackage,
      mermaPercent
    );
    const plates  = calculatePlateCost(allData, numColors, quantity);
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
    breakdown.costoPapel    += paperResult.cost;
    breakdown.costoProcesos += plates.totalCost + cutting.totalCost;

    if (isEditorial) {
      const coverRankings = evaluateAllMachines(pieceWidth, pieceHeight, machines);
      if (coverRankings.length > 0) {
        const bestCover = coverRankings[0];
        const coverSheets = calculatePaperCost(
          quantity, bestCover.imposition.piecesPerSheet,
          coverPaperCost || 55000, coverUnitsPerPackage, mermaPercent
        );
        const coverPlates = calculatePlateCost(allData, numColors, quantity);
        const laminationCost = hasLamination
          ? calculateProcessCost(allData, 'Laminado', quantity)
          : { totalCost: 0 };

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
        breakdown.costoPapel    += coverSheets.cost;
        breakdown.costoProcesos += coverPlates.totalCost + laminationCost.totalCost;
      }
    }

    if (hasBinding && isEditorial) {
      const binding = calculateProcessCost(allData, bindingType, quantity);
      breakdown.finishing.binding = {
        type: bindingType,
        unitCost: binding.unitCost,
        totalCost: binding.totalCost,
      };
      breakdown.costoProcesos += binding.totalCost;
    }

    // Laminado para Flyer (sin tapa separada)
    if (hasLamination && !isEditorial) {
      const lam = calculateProcessCost(allData, 'Laminado', quantity);
      breakdown.finishing.lamination = { totalCost: lam.totalCost };
      breakdown.costoProcesos += lam.totalCost;
    }
  }

  // ── COST SUMMARY (Producción + Margen + IVA) ─────────────────
  breakdown.costoProduccion = breakdown.costoPapel + breakdown.costoProcesos;
  breakdown.margenGanancia = Math.round(breakdown.costoProduccion * (marginPercent / 100));
  breakdown.subtotalConMargen = breakdown.costoProduccion + breakdown.margenGanancia;
  breakdown.iva = Math.round(breakdown.subtotalConMargen * (IVA_PERCENT / 100));
  breakdown.totalCost = breakdown.subtotalConMargen + breakdown.iva;
  breakdown.costPerUnit = quantity > 0 ? Math.round(breakdown.totalCost / quantity) : 0;
  breakdown.marginPercent = marginPercent;
  breakdown.ivaPercent = IVA_PERCENT;

  return breakdown;
}
