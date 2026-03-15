/**
 * calculator.js — Calculadora de Cortes
 * Calcula cuántas piezas entran en un pliego y cuántos pliegos se necesitan.
 */

function buildCutSVG(paperW, paperH, cutW, cutH, cols, rows) {
  // Use real cm as SVG units, then viewBox makes it responsive
  const VW = paperW;
  const VH = paperH;
  const cw = cutW;
  const ch = cutH;
  const wasteRight  = VW - cols * cw;
  const wasteBottom = VH - rows * ch;

  const fontSize = Math.max(1.5, Math.min(cw, ch) * 0.28);
  let pieces = '';
  let n = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x  = c * cw + 0.3;
      const y  = r * ch + 0.3;
      const cx2 = x + (cw - 0.6) / 2;
      const cy2 = y + (ch - 0.6) / 2;
      pieces += `
        <rect x="${x}" y="${y}" width="${(cw - 0.6).toFixed(2)}" height="${(ch - 0.6).toFixed(2)}" fill="#5a9e3a" rx="0.8"/>
        <text x="${cx2}" y="${cy2}" dominant-baseline="middle" text-anchor="middle"
          font-size="${fontSize}" font-family="monospace" font-weight="bold" fill="white" opacity="0.9">${n}</text>`;
      n++;
    }
  }

  const wasteStrips = `
    ${wasteRight  > 0.1 ? `<rect x="${(cols * cw).toFixed(2)}" y="0" width="${wasteRight.toFixed(2)}"  height="${VH}" fill="#111" opacity="0.7" rx="0.5"/>` : ''}
    ${wasteBottom > 0.1 ? `<rect x="0" y="${(rows * ch).toFixed(2)}" width="${VW}" height="${wasteBottom.toFixed(2)}" fill="#111" opacity="0.7" rx="0.5"/>` : ''}
  `;

  // aspect ratio box so SVG scales to container width
  const aspectPadding = ((VH / VW) * 100).toFixed(2);

  return `
    <div style="position:relative;width:100%;padding-bottom:${aspectPadding}%;background:#1a1a1a;border:2px solid #444;border-radius:6px;overflow:hidden">
      <svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet"
        style="position:absolute;inset:0;width:100%;height:100%">
        ${pieces}
        ${wasteStrips}
        <rect x="0.15" y="0.15" width="${(VW - 0.3).toFixed(2)}" height="${(VH - 0.3).toFixed(2)}"
          fill="none" stroke="#888" stroke-width="0.5"/>
      </svg>
    </div>
  `;
}

export function renderCalculator(container) {
  container.innerHTML = `
    <div class="calc-panel">
      <div class="calc-header">
        <h2><span class="icon">✂️</span> Calculadora de Cortes</h2>
        <p class="calc-subtitle">Calculá cuántas piezas entran en un pliego y los pliegos necesarios.</p>
      </div>

      <div class="calc-grid">
        <!-- Inputs -->
        <div class="calc-card">
          <h3><span class="icon">📄</span> Tamaño del papel extendido</h3>
          <div class="calc-fields">
            <div class="calc-field">
              <label>Ancho</label>
              <div class="input-unit"><input type="number" id="paperW" placeholder="ej: 70" step="0.1" min="0" /><span>cm</span></div>
            </div>
            <div class="calc-field">
              <label>Largo</label>
              <div class="input-unit"><input type="number" id="paperH" placeholder="ej: 100" step="0.1" min="0" /><span>cm</span></div>
            </div>
            <div class="calc-field">
              <label>Gramaje <span class="optional">(opcional)</span></label>
              <div class="input-unit"><input type="number" id="gramaje" placeholder="ej: 90" step="1" min="0" /><span>g/m²</span></div>
            </div>
          </div>

          <h3 style="margin-top:1.5rem"><span class="icon">✂️</span> Tamaño de corte</h3>
          <div class="calc-fields">
            <div class="calc-field">
              <label>Ancho</label>
              <div class="input-unit"><input type="number" id="cutW" placeholder="ej: 14" step="0.1" min="0" /><span>cm</span></div>
            </div>
            <div class="calc-field">
              <label>Largo</label>
              <div class="input-unit"><input type="number" id="cutH" placeholder="ej: 21.6" step="0.1" min="0" /><span>cm</span></div>
            </div>
          </div>

          <h3 style="margin-top:1.5rem"><span class="icon">🔢</span> Cantidad deseada</h3>
          <div class="calc-fields">
            <div class="calc-field">
              <label>Piezas / cortes</label>
              <div class="input-unit"><input type="number" id="desiredQty" placeholder="ej: 340" step="1" min="1" /><span>ud</span></div>
            </div>
            <div class="calc-field">
              <label>Merma</label>
              <div class="input-unit"><input type="number" id="mermaCalc" placeholder="10" step="1" min="0" max="100" value="10" /><span>%</span></div>
            </div>
          </div>

          <button id="btnCalc" class="calc-btn">
            <span class="btn-icon">⚡</span> Calcular
          </button>
        </div>

        <!-- Results -->
        <div class="calc-card" id="calcResults">
          <div class="calc-placeholder">
            <div class="placeholder-icon">✂️</div>
            <h3>Listo para calcular</h3>
            <p>Ingresá los tamaños y presioná <strong>Calcular</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btnCalc').addEventListener('click', () => {
    const paperW   = parseFloat(document.getElementById('paperW').value);
    const paperH   = parseFloat(document.getElementById('paperH').value);
    const cutW     = parseFloat(document.getElementById('cutW').value);
    const cutH     = parseFloat(document.getElementById('cutH').value);
    const qty      = parseInt(document.getElementById('desiredQty').value, 10);
    const merma    = parseFloat(document.getElementById('mermaCalc').value) || 0;
    const gramaje  = document.getElementById('gramaje').value;

    const resultsDiv = document.getElementById('calcResults');

    if (!paperW || !paperH || !cutW || !cutH) {
      resultsDiv.innerHTML = `<div class="error-card"><h3>⚠️ Faltan datos</h3><p>Ingresá el tamaño del papel y del corte.</p></div>`;
      return;
    }
    if (cutW > paperW || cutH > paperH) {
      // Try rotated
      if (cutH > paperW || cutW > paperH) {
        resultsDiv.innerHTML = `<div class="error-card"><h3>⚠️ Error</h3><p>El corte es más grande que el papel.</p></div>`;
        return;
      }
    }

    // Normal orientation
    const normalCols = Math.floor(paperW / cutW);
    const normalRows = Math.floor(paperH / cutH);
    const normalCount = normalCols * normalRows;
    const normalWasteW = paperW - normalCols * cutW;
    const normalWasteH = paperH - normalRows * cutH;
    const normalWasteArea = (paperW * paperH - normalCount * cutW * cutH) / (paperW * paperH) * 100;

    // Rotated orientation (cut rotated 90°)
    const rotCols = Math.floor(paperW / cutH);
    const rotRows = Math.floor(paperH / cutW);
    const rotCount = rotCols * rotRows;
    const rotWasteArea = (paperW * paperH - rotCount * cutH * cutW) / (paperW * paperH) * 100;

    const best = normalCount >= rotCount
      ? { count: normalCount, cols: normalCols, rows: normalRows, waste: normalWasteArea.toFixed(1), orientation: 'Normal', wasteW: normalWasteW.toFixed(1), wasteH: normalWasteH.toFixed(1) }
      : { count: rotCount,    cols: rotCols,    rows: rotRows,    waste: rotWasteArea.toFixed(1),    orientation: 'Rotado 90°', wasteW: (paperW - rotCols*cutH).toFixed(1), wasteH: (paperH - rotRows*cutW).toFixed(1) };
    const other = normalCount >= rotCount
      ? { count: rotCount,  cols: rotCols,  rows: rotRows,  waste: rotWasteArea.toFixed(1),    orientation: 'Rotado 90°' }
      : { count: normalCount, cols: normalCols, rows: normalRows, waste: normalWasteArea.toFixed(1), orientation: 'Normal' };

    // Sheets needed
    let sheetsBase = 0, sheetsWithMerma = 0, totalPieces = 0;
    if (qty && best.count > 0) {
      sheetsBase     = Math.ceil(qty / best.count);
      sheetsWithMerma = Math.ceil(sheetsBase * (1 + merma / 100));
      totalPieces    = sheetsWithMerma * best.count;
    }

    const effCutW = best.orientation === 'Rotado 90°' ? cutH : cutW;
    const effCutH = best.orientation === 'Rotado 90°' ? cutW : cutH;

    resultsDiv.innerHTML = `
      <h3><span class="icon">✂️</span> Área de corte</h3>

      <div class="cut-top-layout">
        <!-- SVG diagram -->
        <div class="cut-svg-wrap">
          ${buildCutSVG(paperW, paperH, effCutW, effCutH, best.cols, best.rows)}
          <div class="cut-viz-legend">
            <span class="legend-piece">■ Pieza (${effCutW}×${effCutH} cm)</span>
            <span class="legend-waste">■ Desperdicio</span>
          </div>
        </div>

        <!-- Key stats beside the SVG -->
        <div class="cut-side-stats">
          <div class="big-number">${best.count}</div>
          <div class="big-label">piezas / pliego</div>
          <div class="orientation-badge" style="margin:0.5rem auto">${best.orientation}</div>
          <hr style="border-color:#333;margin:0.75rem 0"/>
          <div class="calc-stat"><span class="stat-label">Distribución</span><span class="stat-value">${best.cols} × ${best.rows}</span></div>
          <div class="calc-stat"><span class="stat-label">Desperdicio</span><span class="stat-value ${parseFloat(best.waste) > 30 ? 'warn' : ''}">${best.waste}%</span></div>
          <div class="calc-stat"><span class="stat-label">Sobrante ancho</span><span class="stat-value">${best.wasteW} cm</span></div>
          <div class="calc-stat"><span class="stat-label">Sobrante largo</span><span class="stat-value">${best.wasteH} cm</span></div>
        </div>
      </div>

      ${qty ? `
      <div class="calc-sheets-summary">
        <h4>Para <strong>${qty} piezas</strong>${gramaje ? ` (${gramaje} g/m²)` : ''}:</h4>
        <div class="calc-result-grid">
          <div class="calc-stat"><span class="stat-label">Pliegos base</span><span class="stat-value highlight">${sheetsBase}</span></div>
          <div class="calc-stat"><span class="stat-label">Con ${merma}% merma</span><span class="stat-value highlight">${sheetsWithMerma}</span></div>
          <div class="calc-stat"><span class="stat-label">Piezas totales</span><span class="stat-value">${totalPieces}</span></div>
          <div class="calc-stat"><span class="stat-label">Excedente</span><span class="stat-value">${totalPieces - qty} ud</span></div>
        </div>
      </div>
      ` : ''}

      ${other.count > 0 ? `
      <div class="calc-other-orientation">
        <span class="other-label">Alternativa (${other.orientation}):</span>
        <span>${other.count} piezas/pliego — ${other.waste}% desperdicio (${other.cols}×${other.rows})</span>
      </div>
      ` : ''}
    `;
  });
}
