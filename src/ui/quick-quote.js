/**
 * quick-quote.js — Tabla de Cotización Rápida (vanilla JS).
 * Grilla tipo spreadsheet para cotizar múltiples productos de una vez.
 */

const COLORES = ['1x0', '1x1', '2x0', '2x2', '4x0', '4x1', '4x4'];
const TERMINACIONES = ['Corte', 'Laminado', 'Anillado', 'Cosido', 'Pegado', 'Engomado', 'Prepicado', 'Sin terminación'];
const PAPELES = ['Bond 75gr', 'Bond 90gr', 'Couché 130gr', 'Couché 170gr', 'Couché 300gr', 'Cartulina 200gr', 'Autocopia CFB 55gr'];

const IVA_RATE = 0.19;

const fmt = (n) => `$${Math.round(n).toLocaleString('es-CL')}`;

function calcularPrecioNeto({ cantidad, color, papel }) {
  const base = 30000;
  const factorColor = { '1x0': 1, '1x1': 1.3, '2x0': 1.5, '2x2': 1.8, '4x0': 2.2, '4x1': 2.5, '4x4': 3 };
  const factorPapel = papel.includes('Couché') ? 1.4 : papel.includes('Cartulina') ? 1.3 : 1;
  const cantNum = Math.max(Number(cantidad) || 1, 1);
  return Math.round(base * (factorColor[color] || 1) * factorPapel * (cantNum / 100));
}

function selectHTML(id, options, selected, cls) {
  return `<select id="${id}" class="${cls}">${options.map(o =>
    `<option value="${o}" ${o === selected ? 'selected' : ''}>${o.toUpperCase()}</option>`
  ).join('')}</select>`;
}

export function renderQuickQuote(container) {
  let cotizaciones = [];

  function render() {
    const totalNeto = cotizaciones.reduce((s, c) => s + c.neto, 0);
    const totalIva = cotizaciones.reduce((s, c) => s + c.iva, 0);
    const totalFinal = cotizaciones.reduce((s, c) => s + c.total, 0);

    container.innerHTML = `
      <div class="qq-wrapper">
        <div class="qq-header">
          <div>
            <h2 class="qq-title">Cotización Rápida</h2>
            <p class="qq-subtitle">Ingrese los datos y presione + para agregar a la tabla</p>
          </div>
          ${cotizaciones.length > 0 ? `<button id="qqClear" class="qq-clear">Limpiar todo</button>` : ''}
        </div>

        <div class="qq-table-wrap">
          <table class="qq-table">
            <thead>
              <tr>
                <th>Tamaño</th>
                <th>Cant</th>
                <th>Tipo P.</th>
                <th>Color</th>
                <th>Ter</th>
                <th>T. E</th>
                <th class="text-right">Neto</th>
                <th class="text-right">IVA</th>
                <th class="text-right">Total</th>
                <th class="th-actions"></th>
              </tr>
            </thead>
            <tbody>
              <!-- Fila de ingreso -->
              <tr class="qq-input-row">
                <td><input type="text" id="qqTamano" placeholder="ej: 21x28" class="qq-input" /></td>
                <td><input type="number" id="qqCantidad" placeholder="1000" min="1" class="qq-input qq-input-sm" /></td>
                <td>${selectHTML('qqPapel', PAPELES, 'Bond 75gr', 'qq-select')}</td>
                <td>${selectHTML('qqColor', COLORES, '4x0', 'qq-select qq-select-sm')}</td>
                <td>${selectHTML('qqTer', TERMINACIONES, 'Corte', 'qq-select')}</td>
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
                <td class="qq-cell-small">${c.papel}</td>
                <td><span class="qq-badge">${c.color.toUpperCase()}</span></td>
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

      const color = container.querySelector('#qqColor').value;
      const papel = container.querySelector('#qqPapel').value;
      const terminacion = container.querySelector('#qqTer').value;
      const tiempoEntrega = container.querySelector('#qqEntrega').value;

      const neto = calcularPrecioNeto({ cantidad, color, papel });
      const iva = Math.round(neto * IVA_RATE);

      cotizaciones.push({ tamano, cantidad, papel, color, terminacion, tiempoEntrega, neto, iva, total: neto + iva });
      render();
    }

    addBtn.addEventListener('click', agregar);

    // Enter en cualquier input agrega
    container.querySelectorAll('.qq-input-row input').forEach(inp => {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } });
    });

    // Duplicar
    container.querySelectorAll('.qq-btn-dup').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const c = cotizaciones[idx];
        const neto = calcularPrecioNeto(c);
        const iva = Math.round(neto * IVA_RATE);
        cotizaciones.push({ ...c, neto, iva, total: neto + iva });
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

    // Focus en primer input
    tamanoInput?.focus();
  }

  render();
}
