

import { generateQuotation } from '../engine/quotation.js';
import { renderImpositionPreview } from './visualizer.js';
import { compareMachines } from '../engine/imposition.js';
import { getMachines } from '../engine/pricing.js';
import { saveCotizacion } from '../db/firestore-api.js';

const COLORES = [
  { value: '1', doble: false, label: '1x0 — Negro solo frente' },
  { value: '1', doble: true,  label: '1x1 — Negro ambos lados' },
  { value: '2', doble: false, label: '2x0 — 2 colores frente' },
  { value: '2', doble: true,  label: '2x2 — 2 colores ambos lados' },
  { value: '4', doble: false, label: '4x0 — Full Color frente' },
  { value: '4', doble: true,  label: '4x4 — Full Color ambos lados' },
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

  const machineList = getMachines(allData);
  const machineOpts = `<option value="">Automático (mejor)</option>` +
    machineList.map(m => `<option value="${m.nombre}">${m.nombre} (${m.papel_ancho}×${m.papel_largo})</option>`).join('');

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
      forceMachine:            row.forceMachine || null,
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
              <label>Máquina</label>
              <select id="qqMaquina" class="qq-select">${machineOpts}</select>
            </div>
            <div class="qq-field">
              <label>Ancho (cm)</label>
              <input type="number" id="qqAncho" placeholder="21.6" step="0.1" min="1" class="qq-input" />
            </div>
            <div class="qq-field">
              <label>Largo (cm)</label>
              <input type="number" id="qqLargo" placeholder="28" step="0.1" min="1" class="qq-input" />
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
        <div id="qqSugerencias" class="qq-sugerencias"></div>

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
              </tr>
              <tr class="qq-viz-row">
                <td colspan="14">
                  <div id="qqViz${i}" class="qq-viz-container"></div>
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
        </div>
        <div class="qq-actions-row">
          <button id="qqSave" class="qq-btn-save">Guardar en Firebase</button>
          <button id="qqPdf" class="qq-btn-pdf">Generar PDF</button>
        </div>` : `
        <div class="qq-empty-state">
          <p>Sin cotizaciones. Complete el formulario y presione <strong>"+ Agregar Cotización"</strong>.</p>
        </div>`}
      </div>
    `;

    // ── RENDER IMPOSITION PREVIEWS ──────────────────────────
    cotizaciones.forEach((c, i) => {
      if (c.renderData) {
        const vizEl = container.querySelector(`#qqViz${i}`);
        if (vizEl) renderImpositionPreview(vizEl, c.renderData, c.machineName);
      }
    });

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

    // Comparación de máquinas
    const anchoInput = container.querySelector('#qqAncho');
    const largoInput = container.querySelector('#qqLargo');
    const sugBox = container.querySelector('#qqSugerencias');
    const machines = getMachines(allData);

    function actualizarComparacion() {
      const tw = parseFloat(anchoInput.value);
      const th = parseFloat(largoInput.value);
      if (!tw || !th || isNaN(tw) || isNaN(th)) {
        sugBox.innerHTML = '';
        return;
      }
      const results = compareMachines(tw, th, machines);
      if (results.length === 0) {
        sugBox.innerHTML = '<p class="qq-sug-empty">La pieza no cabe en ninguna máquina.</p>';
        return;
      }
      sugBox.innerHTML = `
        <p class="qq-sug-title">Comparación de máquinas para ${tw}×${th} cm:</p>
        <div class="qq-sug-grid">
          ${results.map((r, i) => `
            <button class="qq-sug-card ${i === 0 ? 'qq-sug-better' : ''}" data-machine="${r.machine}">
              <span class="qq-sug-size">${r.machine}</span>
              <span class="qq-sug-detail">Papel ${r.paperSize} — ${r.cols}×${r.rows} = ${r.pieces} pzas${r.rotated ? ' ↻' : ''}</span>
              <span class="qq-sug-waste">Merma: ${r.waste}%${i === 0 ? ' ★ Mejor opción' : ''}</span>
            </button>`).join('')}
        </div>`;
      // Click to select machine
      sugBox.querySelectorAll('.qq-sug-card').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelector('#qqMaquina').value = btn.dataset.machine;
          sugBox.innerHTML = '';
        });
      });
    }
    anchoInput.addEventListener('input', actualizarComparacion);
    largoInput.addEventListener('input', actualizarComparacion);

    // Agregar
    function agregar() {
      const ancho = container.querySelector('#qqAncho').value;
      const largo = container.querySelector('#qqLargo').value;
      const cantidad = container.querySelector('#qqCantidad').value;
      if (!ancho || !largo || !cantidad) return;
      const tamano = `${ancho}x${largo}`;

      const forceMachine = container.querySelector('#qqMaquina').value || null;
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
      const colorLabel = colorObj ? colorObj.label.split(' — ')[0] : '4x4';

      const terms = [];
      if (laminado) terms.push('Laminado');
      if (isEditorial) terms.push(encuadernacion);
      if (pruebaDigital) terms.push('Prueba VB');
      const terminaciones = terms.length > 0 ? terms.join(', ') : 'Solo impresión';

      const row = {
        tipo, tamano, cantidad, paginas, papelIntIdx, papelTapaIdx, colorIdx,
        encuadernacion, tiempoEntrega, margen, laminado, pruebaDigital,
        pruebaCosto: pruebaCostoVal, papelIntNombre, papelTapaNombre, colorLabel, terminaciones,
        forceMachine,
      };

      const quote = calcular(row);
      if (!quote || quote.error) {
        alert(quote?.error || 'Formato inválido. Use "anchoXalto" (ej: 21.6x28)');
        return;
      }

      const neto = quote.subtotalConMargen;
      const iva = quote.iva;
      const total = quote.totalCost;

      const renderData = quote.interior?.render || null;
      const machineName = quote.interior?.machine || '';
      cotizaciones.push({ ...row, neto, iva, total, renderData, machineName });
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

    // Guardar en Firebase
    container.querySelector('#qqSave')?.addEventListener('click', async () => {
      const btn = container.querySelector('#qqSave');
      btn.disabled = true;
      btn.textContent = 'Guardando...';
      try {
        for (const c of cotizaciones) {
          await saveCotizacion({
            productType: c.tipo,
            quantity: parseInt(c.cantidad, 10),
            dimensions: c.tamano,
            marginPercent: parseInt(c.margen, 10) || 30,
            costoPapel: 0,
            costoProcesos: 0,
            costoProduccion: c.neto,
            margenGanancia: Math.round(c.neto * (parseInt(c.margen, 10) || 30) / 130),
            iva: c.iva,
            totalCost: c.total,
            costPerUnit: Math.round(c.total / (parseInt(c.cantidad, 10) || 1)),
            interior: { machine: c.machineName },
            finishing: { binding: { type: c.terminaciones } },
          }, {});
        }
        btn.textContent = 'Guardado!';
        setTimeout(() => { btn.textContent = 'Guardar en Firebase'; btn.disabled = false; }, 2000);
      } catch (e) {
        console.error('Error guardando:', e);
        btn.textContent = 'Error al guardar';
        btn.disabled = false;
      }
    });

    // Generar PDF
    container.querySelector('#qqPdf')?.addEventListener('click', () => {
      const totalNeto = cotizaciones.reduce((s, c) => s + c.neto, 0);
      const totalIva = cotizaciones.reduce((s, c) => s + c.iva, 0);
      const totalFinal = cotizaciones.reduce((s, c) => s + c.total, 0);
      const fecha = new Date().toLocaleDateString('es-CL');

      const rows = cotizaciones.map((c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${c.tipo}</td>
          <td>${c.tamano.toUpperCase()}</td>
          <td>${Number(c.cantidad).toLocaleString('es-CL')}</td>
          <td>${c.paginas || '—'}</td>
          <td>${c.papelIntNombre}</td>
          <td>${c.papelTapaNombre || '—'}</td>
          <td>${c.colorLabel}</td>
          <td>${c.terminaciones}</td>
          <td>${c.tiempoEntrega || '—'}</td>
          <td style="text-align:right">${fmt(c.neto)}</td>
          <td style="text-align:right">${fmt(c.iva)}</td>
          <td style="text-align:right;font-weight:700">${fmt(c.total)}</td>
        </tr>`).join('');

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Cotización PB Impresión</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; font-size: 12px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1a5c2e; padding-bottom: 16px; margin-bottom: 24px; }
  .logo-text { font-size: 22px; font-weight: 700; color: #1a5c2e; }
  .logo-sub { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
  .info-box { text-align: right; font-size: 11px; color: #555; }
  .info-box strong { color: #1a1a1a; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #1a5c2e; color: white; padding: 8px 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
  td { padding: 8px 6px; border-bottom: 1px solid #e0e0e0; font-size: 11px; }
  tr:nth-child(even) { background: #f8f8f8; }
  .totals td { font-weight: 700; border-top: 2px solid #1a5c2e; font-size: 12px; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 10px; color: #888; }
  .notes { margin-top: 24px; padding: 12px; background: #f5f5f5; border-radius: 6px; font-size: 10px; color: #555; }
  @media print { body { padding: 20px; } }
</style></head><body>
  <div class="header">
    <div>
      <div class="logo-text">PB Impresión y Terminación</div>
      <div class="logo-sub">Cotización de productos gráficos</div>
    </div>
    <div class="info-box">
      <div><strong>Fecha:</strong> ${fecha}</div>
      <div><strong>Items:</strong> ${cotizaciones.length}</div>
      <div><strong>Validez:</strong> 15 días</div>
    </div>
  </div>
  <table>
    <thead><tr>
      <th>#</th><th>Tipo</th><th>Tamaño</th><th>Cant</th><th>Pág</th>
      <th>Papel Int.</th><th>Papel Tapa</th><th>Color</th><th>Terminaciones</th>
      <th>Entrega</th><th style="text-align:right">Neto</th><th style="text-align:right">IVA</th>
      <th style="text-align:right">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr class="totals">
      <td colspan="10" style="text-align:right">TOTALES</td>
      <td style="text-align:right">${fmt(totalNeto)}</td>
      <td style="text-align:right">${fmt(totalIva)}</td>
      <td style="text-align:right">${fmt(totalFinal)}</td>
    </tr></tfoot>
  </table>
  <div class="notes">
    <strong>Notas:</strong><br/>
    • Precios en pesos chilenos (CLP), IVA 19% incluido en el total.<br/>
    • Cotización válida por 15 días desde la fecha de emisión.<br/>
    • Tiempos de entrega sujetos a confirmación de arte final.
  </div>
  <div class="footer">
    <span>PB Impresión y Terminación</span>
    <span>Generado el ${fecha}</span>
  </div>
</body></html>`;

      const w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
    });

    container.querySelector('#qqAncho')?.focus();
  }

  render();
}
