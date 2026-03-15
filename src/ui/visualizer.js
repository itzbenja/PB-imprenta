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

  const { paperW, paperH, printAreaW, printAreaH, pieceW, pieceH, cols, rows, rotated,
          originalPieceW, originalPieceH } = render;

  const marginL = (paperW - printAreaW) / 2;
  const marginT = (paperH - printAreaH) / 2;
  const totalPieces = cols * rows;

  // Font size relative to piece size in viewBox units
  const fontSize = Math.max(1, Math.min(pieceW * 0.22, pieceH * 0.22, 4));

  // Pieces with sequential numbers
  let pieces = '';
  let n = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x  = marginL + c * pieceW + 0.3;
      const y  = marginT + r * pieceH + 0.3;
      const cx = x + (pieceW - 0.6) / 2;
      const cy = y + (pieceH - 0.6) / 2;
      pieces += `
        <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}"
          width="${(pieceW - 0.6).toFixed(2)}" height="${(pieceH - 0.6).toFixed(2)}"
          fill="#5a9e3a" rx="0.8"/>
        <text x="${cx.toFixed(2)}" y="${cy.toFixed(2)}"
          dominant-baseline="middle" text-anchor="middle"
          font-size="${fontSize.toFixed(2)}" font-family="monospace" font-weight="bold"
          fill="white">${n}</text>`;
      n++;
    }
  }

  // Waste + margin zones
  const usedW = cols * pieceW;
  const usedH = rows * pieceH;
  let extras = '';
  if (marginL > 0.5) {
    extras += `<rect x="0" y="0" width="${marginL.toFixed(2)}" height="${paperH}" fill="#0d0d0d" opacity="0.6"/>
               <rect x="${(paperW - marginL).toFixed(2)}" y="0" width="${marginL.toFixed(2)}" height="${paperH}" fill="#0d0d0d" opacity="0.6"/>`;
  }
  if (marginT > 0.5) {
    extras += `<rect x="0" y="0" width="${paperW}" height="${marginT.toFixed(2)}" fill="#0d0d0d" opacity="0.6"/>
               <rect x="0" y="${(paperH - marginT).toFixed(2)}" width="${paperW}" height="${marginT.toFixed(2)}" fill="#0d0d0d" opacity="0.6"/>`;
  }
  const wR = printAreaW - usedW;
  const wB = printAreaH - usedH;
  if (wR > 0.3) extras += `<rect x="${(marginL + usedW).toFixed(2)}" y="${marginT.toFixed(2)}" width="${wR.toFixed(2)}" height="${usedH.toFixed(2)}" fill="#111" opacity="0.7"/>`;
  if (wB > 0.3) extras += `<rect x="${marginL.toFixed(2)}" y="${(marginT + usedH).toFixed(2)}" width="${usedW.toFixed(2)}" height="${wB.toFixed(2)}" fill="#111" opacity="0.7"/>`;

  container.innerHTML = `
    <div class="viz-container">
      <div class="viz-header">
        <h4>✂️ Cortes — ${machineName}</h4>
        <div class="viz-meta">
          <span class="viz-tag">Papel: ${paperW}×${paperH} cm</span>
          <span class="viz-tag">Pieza: ${originalPieceW}×${originalPieceH} cm${rotated ? ' ↻' : ''}</span>
          <span class="viz-tag viz-tag-accent">${cols}×${rows} = ${totalPieces} piezas</span>
        </div>
      </div>
      <div class="viz-svg-box">
        <svg viewBox="0 0 ${paperW} ${paperH}" preserveAspectRatio="xMidYMid meet"
          style="width:100%;height:100%;display:block">
          <rect x="0" y="0" width="${paperW}" height="${paperH}" fill="#1a1a1a"/>
          ${extras}
          ${pieces}
          <rect x="0.2" y="0.2" width="${(paperW - 0.4).toFixed(2)}" height="${(paperH - 0.4).toFixed(2)}"
            fill="none" stroke="#555" stroke-width="0.4"/>
        </svg>
      </div>
      <div class="viz-legend">
        <span class="legend-piece">■ Pieza (${originalPieceW}×${originalPieceH} cm)</span>
        <span class="legend-waste">■ Desperdicio / Margen</span>
        ${rotated ? '<span class="viz-tag viz-tag-rotated" style="font-size:.75rem">↻ Rotada 90°</span>' : ''}
      </div>
    </div>`;
}
