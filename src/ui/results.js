/**
 * results.js — V3: Renders quotation with imposition visualizer,
 * cost summary (Costo Papel, Costo Procesos, Margen, IVA, Total).
 */

import { renderImpositionPreview } from './visualizer.js';

export function renderResults(container, quote) {
  if (!quote) { container.innerHTML = ''; return; }

  if (quote.error) {
    container.innerHTML = `
      <div class="results-panel visible">
        <div class="error-card">
          <h3>⚠️ Error</h3>
          <p>${quote.error}</p>
        </div>
      </div>`;
    return;
  }

  const fmt = (n) => `$${Math.round(n).toLocaleString('es-CL')}`;

  let html = `<div class="results-panel animate-in">`;

  // ── Header ────────────────────────────────────────────────────
  html += `
    <div class="results-header">
      <h2><span class="icon">📊</span> Cotización — ${quote.productType}</h2>
      <div class="results-meta">
        <span class="badge">${quote.quantity} unidades</span>
        <span class="badge">${quote.dimensions}</span>
      </div>
    </div>`;

  // ── IMPOSITION VISUALIZER (for best machine) ──────────────────
  if (quote.interior?.render) {
    html += `<div id="vizInterior" class="result-card viz-card"></div>`;
  }

  // ── Interior / Main section ───────────────────────────────────
  if (quote.interior) {
    const i = quote.interior;
    html += `
      <div class="result-card">
        <h3><span class="icon">📄</span> ${quote.productType === 'Flyer' ? 'Impresión' : 'Interior'}</h3>
        <div class="card-grid">
          <div class="stat">
            <span class="stat-label">Máquina</span>
            <span class="stat-value">${i.machine}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Piezas/Pliego</span>
            <span class="stat-value highlight">${i.piecesPerSheet}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Distribución</span>
            <span class="stat-value">${i.layout} (${i.orientation})</span>
          </div>
          <div class="stat">
            <span class="stat-label">Desperdicio</span>
            <span class="stat-value ${i.wastePercent > 30 ? 'warn' : ''}">${i.wastePercent}%</span>
          </div>
        </div>
        ${i.interiorPages ? `
        <div class="card-grid">
          <div class="stat">
            <span class="stat-label">Páginas</span>
            <span class="stat-value">${i.interiorPages}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Pliegos de prensa</span>
            <span class="stat-value">${i.totalPressSheets}</span>
          </div>
        </div>` : ''}
        <div class="cost-breakdown">
          <div class="cost-row">
            <span>Papel: ${i.sheetsNeeded} hojas + merma = ${i.sheetsWithMerma} hojas (${i.packages} paq. × ${i.unitsPerPackage})</span>
            <span>${fmt(i.paperCost)}</span>
          </div>
          <div class="cost-row">
            <span>Planchas: ${i.platesDetail}</span>
            <span>${fmt(i.platesCost)}</span>
          </div>
          <div class="cost-row">
            <span>Corte</span>
            <span>${fmt(i.cuttingCost)}</span>
          </div>
          <div class="cost-row subtotal">
            <span>Subtotal Interior</span>
            <span>${fmt(i.subtotal)}</span>
          </div>
        </div>
      </div>`;

    // Machine comparison table
    if (i.allMachineOptions && i.allMachineOptions.length > 1) {
      html += `
        <div class="result-card machine-comparison">
          <h4><span class="icon">🏭</span> Comparación de Máquinas</h4>
          <table>
            <thead>
              <tr><th>Máquina</th><th>Piezas/Pliego</th><th>Desperdicio</th><th>Orientación</th></tr>
            </thead>
            <tbody>
              ${i.allMachineOptions.map((m, idx) => `
                <tr class="${idx === 0 ? 'best' : ''}" data-machine-idx="${idx}">
                  <td>${m.machine} ${idx === 0 ? '⭐' : ''}</td>
                  <td>${m.piecesPerSheet}</td>
                  <td>${m.waste}%</td>
                  <td>${m.orientation}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }
  }

  // ── Cover section ─────────────────────────────────────────────
  if (quote.cover) {
    const c = quote.cover;
    html += `
      <div class="result-card">
        <h3><span class="icon">🎨</span> Tapa / Cubierta</h3>
        <div class="card-grid">
          <div class="stat">
            <span class="stat-label">Máquina</span>
            <span class="stat-value">${c.machine}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Piezas/Pliego</span>
            <span class="stat-value highlight">${c.piecesPerSheet}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Distribución</span>
            <span class="stat-value">${c.layout} (${c.orientation})</span>
          </div>
          <div class="stat">
            <span class="stat-label">Desperdicio</span>
            <span class="stat-value">${c.wastePercent}%</span>
          </div>
        </div>
        <div class="cost-breakdown">
          <div class="cost-row">
            <span>Material tapa: ${c.sheetsWithMerma} hojas (${c.packages} paq. × ${c.unitsPerPackage})</span>
            <span>${fmt(c.paperCost)}</span>
          </div>
          <div class="cost-row">
            <span>Planchas tapa</span>
            <span>${fmt(c.platesCost)}</span>
          </div>
          ${c.laminationCost > 0 ? `
          <div class="cost-row">
            <span>Laminado</span>
            <span>${fmt(c.laminationCost)}</span>
          </div>` : ''}
          <div class="cost-row subtotal">
            <span>Subtotal Tapa</span>
            <span>${fmt(c.subtotal)}</span>
          </div>
        </div>
      </div>`;
  }

  // ── Finishing ─────────────────────────────────────────────────
  if (quote.finishing.binding) {
    const b = quote.finishing.binding;
    html += `
      <div class="result-card">
        <h3><span class="icon">🔧</span> Terminaciones</h3>
        <div class="cost-breakdown">
          <div class="cost-row">
            <span>${b.type}: ${quote.quantity} × ${fmt(b.unitCost)}</span>
            <span>${fmt(b.totalCost)}</span>
          </div>
        </div>
      </div>`;
  }

  // ── COST SUMMARY ─────────────────────────────────────────────
  html += `
    <div class="result-card cost-summary-card">
      <h3><span class="icon">💰</span> Resumen de Costos</h3>
      <div class="cost-breakdown">
        <div class="cost-row">
          <span>Costo Papel</span>
          <span>${fmt(quote.costoPapel)}</span>
        </div>
        <div class="cost-row">
          <span>Costo Procesos (planchas, corte, laminado, encuadernación)</span>
          <span>${fmt(quote.costoProcesos)}</span>
        </div>
        <div class="cost-row subtotal">
          <span>Costo de Producción</span>
          <span>${fmt(quote.costoProduccion)}</span>
        </div>
        <div class="cost-row margin-row">
          <span>Margen de Ganancia (${quote.marginPercent}%)</span>
          <span>+ ${fmt(quote.margenGanancia)}</span>
        </div>
        <div class="cost-row">
          <span>Subtotal con Margen</span>
          <span>${fmt(quote.subtotalConMargen)}</span>
        </div>
        <div class="cost-row iva-row">
          <span>IVA (${quote.ivaPercent}%)</span>
          <span>+ ${fmt(quote.iva)}</span>
        </div>
      </div>
    </div>`;

  // ── GRAND TOTAL ───────────────────────────────────────────────
  html += `
    <div class="total-card">
      <div class="total-row">
        <span>TOTAL</span>
        <span class="total-amount">${fmt(quote.totalCost)}</span>
      </div>
      <div class="per-unit">
        Costo unitario: ${fmt(quote.costPerUnit)}
      </div>
    </div>`;

  html += `</div>`;
  container.innerHTML = html;

  // ── Render imposition visualizer (after DOM is ready) ─────────
  requestAnimationFrame(() => {
    container.querySelector('.results-panel')?.classList.add('visible');

    // Render the best machine's imposition preview
    if (quote.interior?.render) {
      const vizContainer = container.querySelector('#vizInterior');
      if (vizContainer) {
        renderImpositionPreview(vizContainer, quote.interior.render, quote.interior.machine);
      }
    }

    // Make machine comparison rows clickable to switch the visualizer
    if (quote.interior?.allMachineOptions) {
      const rows = container.querySelectorAll('.machine-comparison tr[data-machine-idx]');
      rows.forEach((row) => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
          const idx = parseInt(row.dataset.machineIdx, 10);
          const option = quote.interior.allMachineOptions[idx];
          if (option?.render) {
            const vizContainer = container.querySelector('#vizInterior');
            if (vizContainer) {
              renderImpositionPreview(vizContainer, option.render, option.machine);
            }
            // Update active row styling
            rows.forEach((r) => r.classList.remove('best'));
            row.classList.add('best');
          }
        });
      });
    }
  });
}
