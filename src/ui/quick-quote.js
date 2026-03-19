/**
 * quick-quote.js — Tabla de Cotización Rápida (vanilla JS).
 * Conectado al motor real de cotización (generateQuotation).
 */

import { generateQuotation } from '../engine/quotation.js';

const COLORES = [
  { value: '1', doble: false, label: '1x0 — Negro una cara' },
  { value: '1', doble: true,  label: '1x1 — Negro doble cara' },
  { value: '2', doble: false, label: '2x0 — 2 colores una cara' },
  { value: '2', doble: true,  label: '2x2 — 2 colores doble cara' },
  { value: '4', doble: false, label: '4x0 — Full Color una cara' },
  { value: '4', doble: true,  label: '4x4 — Full Color doble cara' },
];

const TERMINACIONES = ['Sin terminación', 'Corte', 'Laminado', 'Anillado', 'Cosido', 'Pegado', 'Engomado', 'Prepicado'];

const fmt = (n) => `$${Math.round(n).toLocaleString('es-CL')}`;

export function renderQuickQuote(container, allData) {
  // Build paper options from real DB data
  const papeles = (allData.supplies || []).filter(s =>
    s.tipo_insumo === 'Papel Interior' || s.tipo_insumo === 'Papel Tapa'
  );
  const papelOpts = papeles.length > 0
    ? papeles.map((p, i) => `<option value="${i}">${p.nombre_insumo} ${p.gramaje ? p.gramaje + 'gr' : ''}</option>`).join('')
    : `<option value="0">Sin datos — configurar en Precios</option>`;

  const colorOpts = COLORES.map((c, i) =>
    `<option value="${i}" ${i === 4 ? 'selected' : ''}>${c.label}</option>`
  ).join('');

  const terOpts = TERMINACIONES.map(t =>
    `<option value="${t}">${t}</option>`
  ).join('');

  let cotizaciones = [];

  function calcularConMotor(row) {
    const papel = papeles[row.papelIdx] || { costo_paquete: 25000, unidades_por_paquete: 500 };
    const colorObj = COLORES[row.colorIdx] || COLORES[4];
    const [w, h] = row.tamano.split(/x/i).map(s => parseFloat(s.replace(',', '.')));

    if (!w || !h || isNaN(w) || isNaN(h)) return null;

    const params = {
      productType:             'Flyer',
      quantity:                parseInt(row.cantidad, 10) || 1,
      pieceWidth:              w,
      pieceHeight:             h,
      numColors:               parseInt(colorObj.value, 10),
      doubleSided:             colorObj.doble,
      interiorPaperCost:       papel.costo_paquete,
      interiorUnitsPerPackage: papel.unidades_por_paquete,
      hasLamination:           row.terminacion === 'Laminado',
      hasBinding:              ['Anillado', 'Cosido', 'Pegado'].includes(row.terminacion),
      bindingType:             row.terminacion,
      mermaPercent:            10,
      marginPercent:           30,
    };

    try {
      return generateQuotation(allData, params);
    } catch (e) {
      console.error('Error en motor:', e);
      return null;
    }
  }

  function render() {
    const totalNeto = cotizaciones.reduce((s, c) => s + c.neto, 0);
    const totalIva = cotizaciones.reduce((s, c) => s + c.iva, 0);
    const totalFinal = cotizaciones.reduce((s, c) => s + c.total, 0);

    container.innerHTML = `
      <div class="qq-wrapper">
        <div class="qq-header">
          <div>
            <h2 class="qq-title">Cotización Rápida</h2>
            <p class="qq-subtitle">Ingrese los datos y presione + para agregar. Usa precios reales de Firebase.</p>
          </div>
          ${cotizaciones.length > 0 ? `<button id="qqClear" class="qq-clear">Limpiar todo</button>` : ''}
        </div>

        <div class="qq-table-wrap">
          <table class="qq-table">
            <thead>
              <tr>
                <th>Tamaño (cm)</th>
                <th>Cant</th>
                <th>Papel</th>
                <th>Color</th>
                <th>Terminación</th>
                <th>Entrega</th>
                <th class="text-right">Neto</th>
                <th class="text-right">IVA</th>
                <th class="text-right">Total</th>
                <th class="th-actions"></th>
              </tr>
            </thead>
            <tbody>
              <tr class="qq-input-row">
                <td><input type="text" id="qqTamano" placeholder="ej: 21x28" class="qq-input" /></td>
                <td><input type="number" id="qqCantidad" placeholder="1000" min="1" class="qq-input qq-input-sm" /></td>
                <td><select id="qqPapel" class="qq-select">${papelOpts}</select></td>
                <td><select id="qqColor" class="qq-select">${colorOpts}</select></td>
                <td><select id="qqTer" class="qq-select">${terOpts}</select></td>
                <td><input type="text" id="qqEntrega" placeholder="2 días" class="qq-input qq-input-sm" /></td>
                <td class="text-right qq-placeholder">—</td>
                <td class="text-right qq-placeholder">—</td>
                <td class="text-right qq-placeholder">—</td>
                <td class="td-actions"><button id="qqAdd" class="qq-btn-add" title="Agregar cotización">+</button></td>
              </tr>

              ${cotizaciones.length === 0 ? `
              <tr>
                <td colspan="10" class="qq-empty">
                  Sin cotizaciones. Ingrese los datos arriba y presione
                  <span class="qq-plus-hint">+</span> para agregar.
                </td>
              </tr>` : ''}

              ${cotizaciones.map((c, i) => `
              <tr class="qq-row" data-idx="${i}">
                <td class="qq-cell-mono">${c.tamano.toUpperCase()}</td>
                <td>${Number(c.cantidad).toLocaleString('es-CL')}</td>
                <td class="qq-cell-small">${c.papelNombre}</td>
                <td><span class="qq-badge">${c.colorLabel}</span></td>
                <td class="qq-cell-small">${c.terminacion}</td>
                <td class="qq-cell-small">${c.tiempoEntrega || '—'}</td>
                <td class="text-right qq-cell-mono">${fmt(c.neto)}</td>
                <td class="text-right qq-cell-dim">${fmt(c.iva)}</td>
                <td class="text-right qq-cell-total">${fmt(c.total)}</td>
                <td class="td-actions">
                  <div class="qq-row-actions">
                    <button class="qq-btn-icon qq-btn-dup" data-idx="${i}" title="Duplicar">⧉</button>
                    <button class="qq-btn-icon qq-btn-del" data-idx="${i}" title="Eliminar">✕</button>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>

            ${cotizaciones.length > 0 ? `
            <tfoot>
              <tr class="qq-totals">
                <td colspan="6" class="text-right qq-totals-label">
                  Totales (${cotizaciones.length} ${cotizaciones.length === 1 ? 'item' : 'items'})
                </td>
                <td class="text-right qq-cell-mono">${fmt(totalNeto)}</td>
                <td class="text-right qq-cell-dim">${fmt(totalIva)}</td>
                <td class="text-right qq-grand-total">${fmt(totalFinal)}</td>
                <td></td>
              </tr>
            </tfoot>` : ''}
          </table>
        </div>
      </div>
    `;

    // ── Events ──────────────────────────────────────────────
    const addBtn = container.querySelector('#qqAdd');
    const tamanoInput = container.querySelector('#qqTamano');

    function agregar() {
      const tamano = tamanoInput.value.trim();
      const cantidad = container.querySelector('#qqCantidad').value;
      if (!tamano || !cantidad) return;

      const papelIdx = parseInt(container.querySelector('#qqPapel').value, 10);
      const colorIdx = parseInt(container.querySelector('#qqColor').value, 10);
      const terminacion = container.querySelector('#qqTer').value;
      const tiempoEntrega = container.querySelector('#qqEntrega').value;

      const papel = papeles[papelIdx];
      const colorObj = COLORES[colorIdx];
      const papelNombre = papel ? `${papel.nombre_insumo} ${papel.gramaje || ''}gr` : 'Sin datos';
      const colorLabel = colorObj ? colorObj.label.split(' — ')[0] : '4x0';

      const row = { tamano, cantidad, papelIdx, colorIdx, terminacion, tiempoEntrega, papelNombre, colorLabel };
      const quote = calcularConMotor(row);

      if (!quote || quote.error) {
        alert(quote?.error || `Formato inválido. Use "anchoXalto" (ej: 21x28)`);
        return;
      }

      const neto = quote.subtotalConMargen;
      const iva = quote.iva;
      const total = quote.totalCost;

      cotizaciones.push({ ...row, neto, iva, total });
      render();
    }

    addBtn.addEventListener('click', agregar);

    container.querySelectorAll('.qq-input-row input').forEach(inp => {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } });
    });

    // Duplicar
    container.querySelectorAll('.qq-btn-dup').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const c = { ...cotizaciones[idx] };
        cotizaciones.push(c);
        render();
      });
    });

    // Eliminar
    container.querySelectorAll('.qq-btn-del').forEach(btn => {
      btn.addEventListener('click', () => {
        cotizaciones.splice(parseInt(btn.dataset.idx, 10), 1);
        render();
      });
    });

    // Limpiar todo
    container.querySelector('#qqClear')?.addEventListener('click', () => {
      cotizaciones = [];
      render();
    });

    tamanoInput?.focus();
  }

  render();
}
