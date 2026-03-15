/**
 * visualizer.js — Imposition preview: draws pieces on the print sheet at scale.
 *
 * Shows the print area, piece grid, waste zones (right/bottom), and labels.
 * Pure DOM/CSS rendering — no canvas or external libraries.
 */

/**
 * Render a proportional imposition preview into a container.
 *
 * @param {HTMLElement} container
 * @param {object} render - render data from imposition algorithm
 * @param {string} machineName
 */
export function renderImpositionPreview(container, render, machineName) {
  if (!render || render.cols === 0 || render.rows === 0) {
    container.innerHTML = '';
    return;
  }

  // Scale factor: fit into ~400px max width
  const MAX_WIDTH = 420;
  const scale = MAX_WIDTH / render.paperW;

  const paperWpx = Math.round(render.paperW * scale);
  const paperHpx = Math.round(render.paperH * scale);
  const printWpx = Math.round(render.printAreaW * scale);
  const printHpx = Math.round(render.printAreaH * scale);
  const pieceWpx = Math.round(render.pieceW * scale);
  const pieceHpx = Math.round(render.pieceH * scale);

  // Non-printable margin (difference between paper and print area)
  const marginLeft = Math.round(((render.paperW - render.printAreaW) / 2) * scale);
  const marginTop = Math.round(((render.paperH - render.printAreaH) / 2) * scale);

  // Build piece grid HTML
  let piecesHTML = '';
  for (let r = 0; r < render.rows; r++) {
    for (let c = 0; c < render.cols; c++) {
      const x = c * pieceWpx;
      const y = r * pieceHpx;
      piecesHTML += `
        <div class="viz-piece" style="
          left: ${x}px; top: ${y}px;
          width: ${pieceWpx}px; height: ${pieceHpx}px;
        ">
          <span class="viz-piece-label">${render.originalPieceW}×${render.originalPieceH}</span>
          ${render.rotated ? '<span class="viz-rotate-icon">↻</span>' : ''}
        </div>`;
    }
  }

  // Waste zone markers
  const usedWpx = render.cols * pieceWpx;
  const usedHpx = render.rows * pieceHpx;
  const wasteRightPx = printWpx - usedWpx;
  const wasteBottomPx = printHpx - usedHpx;

  let wasteHTML = '';
  if (wasteRightPx > 8) {
    wasteHTML += `
      <div class="viz-waste viz-waste-right" style="
        left: ${usedWpx}px; top: 0;
        width: ${wasteRightPx}px; height: ${usedHpx}px;
      ">
        <span>${render.wasteRight} cm</span>
      </div>`;
  }
  if (wasteBottomPx > 8) {
    wasteHTML += `
      <div class="viz-waste viz-waste-bottom" style="
        left: 0; top: ${usedHpx}px;
        width: ${usedWpx}px; height: ${wasteBottomPx}px;
      ">
        <span>${render.wasteBottom} cm</span>
      </div>`;
  }
  // Corner waste
  if (wasteRightPx > 2 && wasteBottomPx > 2) {
    wasteHTML += `
      <div class="viz-waste viz-waste-corner" style="
        left: ${usedWpx}px; top: ${usedHpx}px;
        width: ${wasteRightPx}px; height: ${wasteBottomPx}px;
      "></div>`;
  }

  container.innerHTML = `
    <div class="viz-container">
      <div class="viz-header">
        <h4><span class="icon">🗺️</span> Mapa de Imposición — ${machineName}</h4>
        <div class="viz-meta">
          <span class="viz-tag">Papel: ${render.paperW}×${render.paperH} cm</span>
          <span class="viz-tag">Área impresión: ${render.printAreaW}×${render.printAreaH} cm</span>
          <span class="viz-tag viz-tag-accent">${render.cols}×${render.rows} = ${render.cols * render.rows} piezas</span>
          ${render.rotated ? '<span class="viz-tag viz-tag-rotated">↻ Rotada 90°</span>' : ''}
        </div>
      </div>
      <div class="viz-paper" style="width: ${paperWpx}px; height: ${paperHpx}px;">
        <div class="viz-print-area" style="
          left: ${marginLeft}px; top: ${marginTop}px;
          width: ${printWpx}px; height: ${printHpx}px;
        ">
          ${piecesHTML}
          ${wasteHTML}
        </div>
        <!-- Paper dimension labels -->
        <div class="viz-dim viz-dim-width">${render.paperW} cm</div>
        <div class="viz-dim viz-dim-height">${render.paperH} cm</div>
      </div>
    </div>`;
}
