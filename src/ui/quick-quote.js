/**
 * quick-quote.js — Tabla de Cotización Rápida (vanilla JS).
 * Soporta Flyer, Libro y Agenda con precios reales de Firebase.
 */

import { generateQuotation } from '../engine/quotation.js';

const COLORES = [
  { value: '1', doble: false, label: '1x0' },
  { value: '1', doble: true,  label: '1x1' },
  { value: '2', doble: false, label: '2x0' },
  { value: '2', doble: true,  label: '2x2' },
  { value: '4', doble: false, label: '4x0' },
  { value: '4', doble: true,  label: '4x4' },
];

const TIPOS = ['Flyer', 'Libro', 'Agenda'];
const ENCUADERNACIONES = ['Anillado', 'Cosido', 'Pegado', 'Cosido Lomo Cuadrado'];

const fmt = (n) => `$${Math.round(n).toLocaleString('es-CL')}`;

export function renderQuickQuote(container, allData) {
  const intPapers = (allData.supplies || []).filter(s => s.tipo_insumo === 'Papel Interior');
  const tapaPapers = (allData.supplies || []).filter(s => s.tipo_insumo === 'Papel Tapa');

  const intOpts = intPapers.map((p, i) =>
    `<option value="${i}">${p.nombre_insumo} ${p.gramaje || ''}gr</option>`
  ).join('') || `<option value="0">Sin datos</option>`;

  const tapaOpts = tapaPapers.map((p, i) =>
    `<option value="${i}">${p.nombre_insumo} ${p.gramaje || ''}gr</option>`
  ).join('') || `<option value="0">Sin datos</option>`;

  const tipoOpts = TIPOS.map(t => `<option value="${t}">${t}</option>`).join('');
  const colorOpts = COLORES.map((c, i) =>
    `<option value="${i}" ${i === 5 ? 'selected' : ''}>${c.label}</option>`
  ).join('');
  const encOpts = ENCUADERNACIONES.map(e => `<option value="${e}">${e}</option>`).join('');

  let cotizaciones = [];

  function calcular(row) {
    const intPaper = intPapers[row.papelIntIdx] || { costo_paquete: 25000, unidades_por_paquete: 500 };
    const coverPaper = tapaPapers[row.papelTapaIdx] || { costo_paquete: 55000, unidades_por_paquete: 100 };
    const colorObj = COLORES[row.colorIdx] || COLORES[5];
    const [w, h] = row.tamano.split(/x/i).map(s => parseFloat(s.replace(',', '.')));

    if (!w || !h || isNaN(w) || isNaN(h)) return null;

    const isEditorial = row.tipo === 'Libro' || row.tipo === 'Agenda';

    const params = {
      productType:             row.tipo,
      quantity:                parseInt(row.cantidad, 10) || 1,
      pieceWidth:              w,
      pieceHeight:             h,
      interiorPages:           isEditorial ? (parseInt(row.paginas, 10) || 100) : 0,
      numColors:               parseInt(colorObj.value, 10),
      doubleSided:             colorObj.doble,
      interiorPaperCost:       intPaper.costo_paquete,
      interiorUnitsPerPackage: intPaper.unidades_por_paquete,
      coverPaperCost:          isEditorial ? coverPaper.costo_paquete : 0,
      coverUnitsPerPackage:    isEditorial ? coverPaper.unidades_por_paquete : 100,
      hasLamination:           row.laminado,
      hasBinding:              isEditorial && row.encuadernacion !== 'Sin encuadernación',
      bindingType:             row.encuadernacion || 'Anillado',
      mermaPercent:            10,
      marginPercent:           parseInt(row.margen, 10) || 30,
      pruebaDigital:           row.pruebaDigital,
      pruebaDigitalCosto:      row.pruebaDigital ? (parseFloat(row.pruebaCosto) || 15000) : 0,
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
            <p class="qq-subtitle">Precios reales desde Firebase. Soporta Flyer, Libro y Agenda.</p>
          </div>
          ${cotizaciones.length > 0 ? `<button id="qqClear" class="qq-clear">Limpiar todo</button>` : ''}
        </div>

        <!-- ── FORMULARIO DE INGRESO ──────────────────────── -->
        <div class="qq-form-card">
          <div class="qq-form-grid">
            <div class="qq-field">
              <label>Tipo</label>
              <select id="qqTipo" class="qq-select">${tipoOpts}</select>
            </div>
            <div class="qq-field">
              <label>Tamaño (cm)</label>
              <input type="text" id="qqTamano" placeholder="21.6x28" class="qq-input" />
            </div>
            <div class="qq-field">
              <label>Cantidad</label>
              <input type="number" id="qqCantidad" placeholder="200" min="1" class="qq-input" />
            </div>
            <div class="qq-field qq-field-editorial">
              <label>Páginas int.</label>
              <input type="number" id="qqPaginas" placeholder="196" min="2" step="2" class="qq-input" />
            </div>
            <div class="qq-field">
              <label>Papel interior</label>
              <select id="qqPapelInt" class="qq-select">${intOpts}</select>
            </div>
            <div class="qq-field qq-field-editorial">
              <label>Papel tapa</label>
              <select id="qqPapelTapa" class="qq-select">${tapaOpts}</select>
            </div>
            <div class="qq-field">
              <label>Color</label>
              <select id="qqColor" class="qq-select">${colorOpts}</select>
            </div>
            <div class="qq-field qq-field-editorial">
              <label>Encuadernación</label>
              <select id="qqEnc" class="qq-select">${encOpts}</select>
            </div>
            <div class="qq-field">
              <label>Entrega</label>
              <input type="text" id="qqEntrega" placeholder="5 días" class="qq-input" />
            </div>
            <div class="qq-field">
              <label>Margen %</label>
              <input type="number" id="qqMargen" value="30" min="0" max="100" class="qq-input" />
            </div>
          </div>
          <div class="qq-checks-row">
            <label class="qq-check"><input type="checkbox" id="qqLaminado" /> Laminado</label>
            <label class="qq-check"><input type="checkbox" id="qqPrueba" /> Prueba digital (VB)
              <input type="number" id="qqPruebaCosto" value="15000" min="0" class="qq-input qq-input-xs" style="display:none;" />
            </label>
          </div>
          <button id="qqAdd" class="qq-btn-add-full">+ Agregar Cotización</button>
        </div>

        <!-- ── TABLA DE RESULTADOS ────────────────────────── -->
        ${cotizaciones.length > 0 ? `
        <div class="qq-table-wrap">
          <table class="qq-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Tamaño</th>
                <th>Cant</th>
                <th>Pág</th>
                <th>Papel int.</th>
                <th>Papel tapa</th>
                <th>Color</th>
                <th>Terminaciones</th>
                <th>Entrega</th>
                <th class="text-right">Neto</th>
                <th class="text-right">IVA</th>
                <th class="text-right">Total</th>
                <th class="th-actions"></th>
              </tr>
            </thead>
            <tbody>
              ${cotizaciones.map((c, i) => `
              <tr class="qq-row">
                <td class="qq-cell-dim">${i + 1}</td>
                <td><span class="qq-badge qq-badge-${c.tipo.toLowerCase()}">${c.tipo}</span></td>
                <td class="qq-cell-mono">${c.tamano.toUpperCase()}</td>
                <td>${Number(c.cantidad).toLocaleString('es-CL')}</td>
                <td>${c.paginas || '—'}</td>
                <td class="qq-cell-small">${c.papelIntNombre}</td>
                <td class="qq-cell-small">${c.papelTapaNombre || '—'}</td>
                <td><span class="qq-badge">${c.colorLabel}</span></td>
                <td class="qq-cell-small">${c.terminaciones}</td>
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
            <tfoot>
              <tr class="qq-totals">
                <td colspan="10" class="text-right qq-totals-label">
                  Totales (${cotizaciones.length} ${cotizaciones.length === 1 ? 'item' : 'items'})
                </td>
                <td class="text-right qq-cell-mono">${fmt(totalNeto)}</td>
                <td class="text-right qq-cell-dim">${fmt(totalIva)}</td>
                <td class="text-right qq-grand-total">${fmt(totalFinal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>` : `
        <div class="qq-empty-state">
          <p>Sin cotizaciones. Complete el formulario y presione <strong>"+ Agregar Cotización"</strong>.</p>
        </div>`}
      </div>
    `;

    // ── EVENTS ──────────────────────────────────────────────
    const tipoSelect = container.querySelector('#qqTipo');
    const editorialFields = container.querySelectorAll('.qq-field-editorial');
    const pruebaCheck = container.querySelector('#qqPrueba');
    const pruebaCosto = container.querySelector('#qqPruebaCosto');

    function toggleEditorial() {
      const isEditorial = tipoSelect.value === 'Libro' || tipoSelect.value === 'Agenda';
      editorialFields.forEach(f => f.style.display = isEditorial ? '' : 'none');
    }
    tipoSelect.addEventListener('change', toggleEditorial);
    toggleEditorial();

    pruebaCheck.addEventListener('change', () => {
      pruebaCosto.style.display = pruebaCheck.checked ? 'inline-block' : 'none';
    });

    // Agregar
    function agregar() {
      const tamano = container.querySelector('#qqTamano').value.trim();
      const cantidad = container.querySelector('#qqCantidad').value;
      if (!tamano || !cantidad) return;

      const tipo = tipoSelect.value;
      const isEditorial = tipo === 'Libro' || tipo === 'Agenda';
      const papelIntIdx = parseInt(container.querySelector('#qqPapelInt').value, 10);
      const papelTapaIdx = parseInt(container.querySelector('#qqPapelTapa').value, 10);
      const colorIdx = parseInt(container.querySelector('#qqColor').value, 10);
      const paginas = container.querySelector('#qqPaginas').value;
      const encuadernacion = container.querySelector('#qqEnc').value;
      const tiempoEntrega = container.querySelector('#qqEntrega').value;
      const margen = container.querySelector('#qqMargen').value;
      const laminado = container.querySelector('#qqLaminado').checked;
      const pruebaDigital = pruebaCheck.checked;
      const pruebaCostoVal = container.querySelector('#qqPruebaCosto').value;

      const intPaper = intPapers[papelIntIdx];
      const tapaPaper = tapaPapers[papelTapaIdx];
      const colorObj = COLORES[colorIdx];

      const papelIntNombre = intPaper ? `${intPaper.nombre_insumo} ${intPaper.gramaje || ''}gr` : '—';
      const papelTapaNombre = isEditorial && tapaPaper ? `${tapaPaper.nombre_insumo} ${tapaPaper.gramaje || ''}gr` : '';
      const colorLabel = colorObj ? colorObj.label : '4x4';

      // Build terminaciones string
      const terms = [];
      if (laminado) terms.push('Laminado');
      if (isEditorial) terms.push(encuadernacion);
      if (pruebaDigital) terms.push('Prueba VB');
      const terminaciones = terms.length > 0 ? terms.join(', ') : 'Solo impresión';

      const row = {
        tipo, tamano, cantidad, paginas, papelIntIdx, papelTapaIdx, colorIdx,
        encuadernacion, tiempoEntrega, margen, laminado, pruebaDigital,
        pruebaCosto: pruebaCostoVal, papelIntNombre, papelTapaNombre, colorLabel, terminaciones,
      };

      const quote = calcular(row);
      if (!quote || quote.error) {
        alert(quote?.error || 'Formato inválido. Use "anchoXalto" (ej: 21.6x28)');
        return;
      }

      const neto = quote.subtotalConMargen;
      const iva = quote.iva;
      const total = quote.totalCost;

      cotizaciones.push({ ...row, neto, iva, total });
      render();
    }

    container.querySelector('#qqAdd').addEventListener('click', agregar);
    container.querySelectorAll('.qq-form-card input').forEach(inp => {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } });
    });

    // Duplicar / Eliminar
    container.querySelectorAll('.qq-btn-dup').forEach(btn => {
      btn.addEventListener('click', () => {
        cotizaciones.push({ ...cotizaciones[parseInt(btn.dataset.idx, 10)] });
        render();
      });
    });
    container.querySelectorAll('.qq-btn-del').forEach(btn => {
      btn.addEventListener('click', () => {
        cotizaciones.splice(parseInt(btn.dataset.idx, 10), 1);
        render();
      });
    });
    container.querySelector('#qqClear')?.addEventListener('click', () => {
      cotizaciones = [];
      render();
    });

    container.querySelector('#qqTamano')?.focus();
  }

  render();
}
