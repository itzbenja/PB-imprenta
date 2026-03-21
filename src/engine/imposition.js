/**
 * imposition.js — V3: Bidirectional imposition algorithm with visual render data.
 *
 * Returns everything needed to draw the imposition preview:
 * cols, rows, effective piece dimensions (after rotation), waste zones.
 */

/**
 * Calculate how many pieces fit on a single sheet for one orientation.
 */
function fitPieces(pieceW, pieceH, areaW, areaH) {
  const cols = Math.floor(areaW / pieceW);
  const rows = Math.floor(areaH / pieceH);
  return { cols, rows, total: cols * rows };
}

/**
 * Calculate imposition for a single machine.
 * Returns full render data: cols, rows, effective piece dimensions,
 * waste zones (right and bottom margins), and machine print area.
 */
export function calculateImposition(pieceW, pieceH, machine) {
  const areaW = machine.impresion_ancho;
  const areaH = machine.impresion_largo;

  const normal = fitPieces(pieceW, pieceH, areaW, areaH);
  const rotated = fitPieces(pieceH, pieceW, areaW, areaH);

  let best, orientation, effectivePieceW, effectivePieceH;

  if (normal.total >= rotated.total) {
    best = normal;
    orientation = 'Normal';
    effectivePieceW = pieceW;
    effectivePieceH = pieceH;
  } else {
    best = rotated;
    orientation = 'Rotada 90°';
    effectivePieceW = pieceH;
    effectivePieceH = pieceW;
  }

  const usedArea = best.total * pieceW * pieceH;
  const totalPrintArea = areaW * areaH;
  const wastePercent = ((totalPrintArea - usedArea) / totalPrintArea) * 100;

  // Waste zones for visual rendering (cm)
  const usedWidth = best.cols * effectivePieceW;
  const usedHeight = best.rows * effectivePieceH;
  const wasteRight = areaW - usedWidth;
  const wasteBottom = areaH - usedHeight;

  return {
    piecesPerSheet: best.total,
    orientation,
    cols: best.cols,
    rows: best.rows,
    wastePercent: Math.round(wastePercent * 100) / 100,
    // ── Render data ──────────────────────────────────────────
    render: {
      printAreaW: areaW,
      printAreaH: areaH,
      paperW: machine.papel_ancho,
      paperH: machine.papel_largo,
      pieceW: effectivePieceW,
      pieceH: effectivePieceH,
      originalPieceW: pieceW,
      originalPieceH: pieceH,
      cols: best.cols,
      rows: best.rows,
      usedWidth,
      usedHeight,
      wasteRight: Math.round(wasteRight * 100) / 100,
      wasteBottom: Math.round(wasteBottom * 100) / 100,
      rotated: orientation !== 'Normal',
    },
  };
}

/**
 * Suggest optimal piece sizes close to the requested dimensions.
 * For each machine, finds the best cols×rows combo and calculates
 * the ideal piece size that eliminates waste.
 *
 * @param {number} targetW - desired piece width (cm)
 * @param {number} targetH - desired piece height (cm)
 * @param {Array} machines - machine list from DB
 * @param {number} tolerance - max cm to adjust (default 2)
 * @returns {Array} suggestions sorted by waste%
 */
/**
 * Compare all machines for a given piece size.
 * Shows how many pieces fit and waste % for each machine.
 * Sorted by most pieces, then least waste.
 */
export function compareMachines(pieceW, pieceH, machines) {
  return machines
    .map(machine => {
      const imp = calculateImposition(pieceW, pieceH, machine);
      if (imp.piecesPerSheet === 0) return null;
      return {
        machine: machine.nombre,
        paperSize: `${machine.papel_ancho}×${machine.papel_largo}`,
        pieces: imp.piecesPerSheet,
        cols: imp.cols,
        rows: imp.rows,
        waste: imp.wastePercent,
        rotated: imp.render.rotated,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.pieces - a.pieces || a.waste - b.waste);
}

/**
 * Evaluate a piece across ALL machines and rank by best yield.
 */
export function evaluateAllMachines(pieceW, pieceH, machines) {
  const results = machines
    .map((machine) => ({
      machine,
      imposition: calculateImposition(pieceW, pieceH, machine),
    }))
    .filter((r) => r.imposition.piecesPerSheet > 0)
    .sort((a, b) => b.imposition.piecesPerSheet - a.imposition.piecesPerSheet);

  return results;
}
