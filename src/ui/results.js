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

  const fmt = (n) => (n == null || isNaN(n)) ? '—' : `$${Math.round(n).toLocaleString('es-CL')}`;

  let html = `<div class="results-panel animate-in">`;

  // ── Header ────────────────────────────────────────────────────
  html += `
    <div class="results-header">
      <h2><span class="icon">📊</span> Cotización — ${quote.productType}</h2>
      <div class="results-meta">
        <span class="badge">${quote.quantity} unidades</span>
        <span class="badge">${quote.dimensions}</span>
        <button class="btn-print no-print" onclick="window.print()" title="Imprimir / Exportar PDF">
          🖨️ Imprimir
        </button>
      </div>
    </div>`;

  // ══════════════════════════════════════════════════════════════
  // TALONARIO — layout específico
  // ══════════════════════════════════════════════════════════════
  if (quote.productType === 'Talonario' && quote.talonario) {
    const t = quote.talonario;
    const fmtCost = (n) => n > 0 ? fmt(n) : '<span class="muted">$0</span>';

    // Visualizador imposición
    if (t.render) html += `<div id="vizInterior" class="result-card viz-card"></div>`;

    // Encabezado imposición
    html += `
      <div class="result-card">
        <h3>✂️ Imposición — ${t.machine}</h3>
        <div class="card-grid">
          <div class="stat"><span class="stat-label">Piezas/Pliego</span><span class="stat-value highlight">${t.piecesPerSheet}</span></div>
          <div class="stat"><span class="stat-label">Distribución</span><span class="stat-value">${t.layout} (${t.orientation})</span></div>
          <div class="stat"><span class="stat-label">Desperdicio</span><span class="stat-value ${parseFloat(t.wastePercent) > 30 ? 'warn' : ''}">${t.wastePercent}%</span></div>
          <div class="stat"><span class="stat-label">Hojas/Vía</span><span class="stat-value">${t.vias[0]?.hojasPorVia ?? '—'}</span></div>
        </div>
      </div>`;

    // Vías de papel
    t.vias.forEach(v => {
      html += `
        <div class="result-card">
          <h3>📄 ${v.nombre}</h3>
          <div class="cost-breakdown">
            <div class="cost-row"><span>${v.papelNombre}: ${v.sheetsNeeded} hojas + merma = ${v.sheetsWithMerma} (${v.packages} paq. × ${v.unitsPerPackage})</span><span>${fmt(v.paperCost)}</span></div>
            <div class="cost-row subtotal"><span>Subtotal papel ${v.nombre}</span><span>${fmt(v.paperCost)}</span></div>
          </div>
        </div>`;
    });

    // Impresión + alzado
    html += `
      <div class="result-card">
        <h3>🖨️ Impresión y Alzado</h3>
        <div class="cost-breakdown">
          <div class="cost-row"><span>Impresión (${t.numColors === 4 ? 'Full Color' : t.numColors + ' Color'})</span><span>${fmtCost(t.impresionCost)}</span></div>
          <div class="cost-row"><span>Planchas</span><span>${fmtCost(t.planchasCost)}</span></div>
          <div class="cost-row"><span>Corte</span><span>${fmtCost(t.corteCost)}</span></div>
          <div class="cost-row"><span>Alzado</span><span>${fmtCost(t.alzadoCost)}</span></div>
        </div>
      </div>`;

    // Terminaciones
    const termActivas = Object.values(t.terminaciones).filter(x => x.active);
    if (termActivas.length > 0) {
      html += `
        <div class="result-card">
          <h3>🔧 Terminaciones</h3>
          <div class="cost-breakdown">
            ${Object.values(t.terminaciones).filter(x => x.active).map(x =>
              `<div class="cost-row"><span>${x.label}</span><span>${fmtCost(x.cost)}</span></div>`
            ).join('')}
          </div>
        </div>`;
    }

    // Tabla comparación máquinas para Talonario
    if (quote.interior?.allMachineOptions && quote.interior.allMachineOptions.length > 1) {
      html += `
        <div class="result-card machine-comparison">
          <h4><span class="icon">🏭</span> Comparación de Máquinas</h4>
          <table>
            <thead>
              <tr><th>Máquina</th><th>Piezas/Pliego</th><th>Desperdicio</th><th>Orientación</th></tr>
            </thead>
            <tbody>
              ${quote.interior.allMachineOptions.map((m, idx) => `
                <tr class="${idx === 0 ? 'best' : ''}">
                  <td>${m.machine} ${idx === 0 ? '⭐' : ''}</td>
                  <td>${m.piecesPerSheet}</td>
                  <td>${m.waste}%</td>
                  <td>${m.orientation}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }

    // Saltar al cost summary
    html += `
      <div class="result-card cost-summary-card">
        <h3>💰 Resumen de Costos</h3>
        <div class="cost-breakdown">
          <div class="cost-row"><span>Costo Papel (${t.vias.length} vías)</span><span>${fmt(quote.costoPapel)}</span></div>
          <div class="cost-row"><span>Costo Procesos (impresión, alzado, terminaciones)</span><span>${fmt(quote.costoProcesos)}</span></div>
          <div class="cost-row subtotal"><span>Costo de Producción</span><span>${fmt(quote.costoProduccion)}</span></div>
          <div class="cost-row margin-row"><span>Margen de Ganancia (${quote.marginPercent}%)</span><span>+ ${fmt(quote.margenGanancia)}</span></div>
          <div class="cost-row"><span>Subtotal con Margen</span><span>${fmt(quote.subtotalConMargen)}</span></div>
          <div class="cost-row iva-row"><span>IVA (${quote.ivaPercent}%)</span><span>+ ${fmt(quote.iva)}</span></div>
          ${quote.pruebaDigital ? `<div class="cost-row" style="color:#f4a261;"><span>Prueba digital (VB)</span><span>+ ${fmt(quote.pruebaDigitalCosto)}</span></div>` : ''}
        </div>
      </div>
      <div class="total-card">
        <div class="total-row"><span>TOTAL</span><span class="total-amount">${fmt(quote.totalCost)}</span></div>
        <div class="per-unit">Costo por talonario: ${fmt(quote.costPerUnit)}</div>
      </div>
    </div>`;

    container.innerHTML = html;
    requestAnimationFrame(() => {
      container.querySelector('.results-panel')?.classList.add('visible');
      if (t.render) {
        const viz = container.querySelector('#vizInterior');
        if (viz) renderImpositionPreview(viz, t.render, t.machine);
      }
    });
    return;
  }

  // ── IMPOSITION VISUALIZER (for best machine) ──────────────────
  if (quote.interior?.render) {
    html += `<div id="vizInterior" class="result-card viz-card"></div>`;
  }

  // ── Interior / Main section ───────────────────────────────────
  if (quote.interior) {
    const i = quote.interior;
    const isAgenda = quote.productType === 'Agenda';
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
            <span class="stat-value ${parseFloat(i.wastePercent) > 30 ? 'warn' : ''}">${i.wastePercent}%</span>
          </div>
        </div>
        ${i.interiorPages ? `
        <div class="card-grid">
          <div class="stat"><span class="stat-label">Páginas</span><span class="stat-value">${i.interiorPages}</span></div>
          <div class="stat"><span class="stat-label">Pliegos prensa</span><span class="stat-value">${i.totalPressSheets}</span></div>
        </div>` : ''}
        <div class="cost-breakdown">
          <div class="cost-row">
            <span>Papel: ${i.sheetsNeeded} hojas + merma = ${i.sheetsWithMerma} (${i.packages} paq. × ${i.unitsPerPackage})</span>
            <span>${fmt(i.paperCost)}</span>
          </div>
          ${isAgenda ? `
          <div class="cost-row"><span>Impresión Interior (B&N)</span><span>${fmt(i.impresionCost)}</span></div>
          <div class="cost-row"><span>Planchas</span><span>${fmt(i.platesCost)}</span></div>
          <div class="cost-row"><span>Corte</span><span>${fmt(i.cuttingCost)}</span></div>
          <div class="cost-row"><span>Anillo</span><span>${fmt(i.anilloCost)}</span></div>
          <div class="cost-row"><span>Anillado</span><span>${fmt(i.anilladoCost)}</span></div>
          ` : `
          <div class="cost-row"><span>Planchas: ${i.platesDetail}</span><span>${fmt(i.platesCost)}</span></div>
          <div class="cost-row"><span>Corte</span><span>${fmt(i.cuttingCost)}</span></div>
          `}
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
    const isAgendaCover = quote.productType === 'Agenda';
    html += `
      <div class="result-card">
        <h3><span class="icon">🎨</span> Tapa / Cubierta</h3>
        <div class="cost-breakdown">
          ${isAgendaCover ? `
          <div class="cost-row"><span>Impresión Tapa</span><span>${fmt(c.impresionCost)}</span></div>
          <div class="cost-row"><span>Polilaminado Tapa</span><span>${fmt(c.polilaminadoCost)}</span></div>
          <div class="cost-row"><span>Cartón Piedra ${c.paperDetail ? `<small class="muted">(${c.paperDetail})</small>` : ''}</span><span>${fmt(c.paperCost)}</span></div>
          <div class="cost-row"><span>Corte Tapa</span><span>${fmt(c.cuttingCost)}</span></div>
          <div class="cost-row"><span>Mano de Obra</span><span>${fmt(c.manoObraCost)}</span></div>
          ` : `
          <div class="cost-row">
            <span>Material tapa: ${c.sheetsWithMerma} hojas (${c.packages} paq. × ${c.unitsPerPackage})</span>
            <span>${fmt(c.paperCost)}</span>
          </div>
          <div class="cost-row"><span>Planchas tapa</span><span>${fmt(c.platesCost)}</span></div>
          ${c.laminationCost > 0 ? `<div class="cost-row"><span>Laminado</span><span>${fmt(c.laminationCost)}</span></div>` : ''}
          `}
          <div class="cost-row subtotal">
            <span>Subtotal Tapa</span>
            <span>${fmt(c.subtotal)}</span>
          </div>
        </div>
      </div>`;
  }

  // ── Agenda Extras: Papel Espejo + Intercalado ─────────────────
  if (quote.agenda_extras && quote.agenda_extras.subtotal > 0) {
    const x = quote.agenda_extras;
    html += `
      <div class="result-card">
        <h3><span class="icon">📑</span> Papel Espejo e Intercalado</h3>
        <div class="cost-breakdown">
          ${x.impresionEspejo  > 0 ? `<div class="cost-row"><span>Impresión Papel Espejo</span><span>${fmt(x.impresionEspejo)}</span></div>` : ''}
          ${x.papelEspejo      > 0 ? `<div class="cost-row"><span>Papel Espejo</span><span>${fmt(x.papelEspejo)}</span></div>` : ''}
          ${x.polilaminadoEspejo > 0 ? `<div class="cost-row"><span>Polilaminado Espejo</span><span>${fmt(x.polilaminadoEspejo)}</span></div>` : ''}
          ${x.corteEspejo      > 0 ? `<div class="cost-row"><span>Corte Espejo</span><span>${fmt(x.corteEspejo)}</span></div>` : ''}
          ${x.impresionIntercalado > 0 ? `<div class="cost-row"><span>Impresión Intercalado</span><span>${fmt(x.impresionIntercalado)}</span></div>` : ''}
          ${x.corteIntercalado > 0 ? `<div class="cost-row"><span>Corte Intercalado</span><span>${fmt(x.corteIntercalado)}</span></div>` : ''}
          <div class="cost-row subtotal"><span>Subtotal Extras</span><span>${fmt(x.subtotal)}</span></div>
        </div>
      </div>`;
  }

  // ── Finishing ─────────────────────────────────────────────────
  if (quote.finishing.binding || quote.finishing.lamination) {
    html += `
      <div class="result-card">
        <h3><span class="icon">🔧</span> Terminaciones</h3>
        <div class="cost-breakdown">
          ${quote.finishing.binding ? `
          <div class="cost-row">
            <span>${quote.finishing.binding.type}: ${quote.quantity} × ${fmt(quote.finishing.binding.unitCost)}</span>
            <span>${fmt(quote.finishing.binding.totalCost)}</span>
          </div>` : ''}
          ${quote.finishing.lamination ? `
          <div class="cost-row">
            <span>Laminado</span>
            <span>${fmt(quote.finishing.lamination.totalCost)}</span>
          </div>` : ''}
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
        ${quote.pruebaDigital ? `
        <div class="cost-row" style="color:#f4a261;">
          <span>Prueba digital (VB)</span>
          <span>+ ${fmt(quote.pruebaDigitalCosto)}</span>
        </div>` : ''}
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
