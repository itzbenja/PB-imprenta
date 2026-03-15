/**
 * admin.js — Admin panel with full CRUD: View, Add, Edit, Delete.
 * Now using Firebase Firestore as backend.
 */

import {
  getMachines, createMachine, updateMachine, deleteMachine,
  getSupplies, createSupply, updateSupply, deleteSupply,
  getProcesses, createProcess, updateProcess, deleteProcess,
  getPricing, createPricing, updatePricing, deletePricing,
} from '../db/firestore-api.js';

export async function renderAdmin(container, onDataChanged) {
  const tabs = [
    { id: 'pricing',   label: '💲 Precios',          render: async () => await renderPricing() },
    { id: 'machines',  label: '🖨️ Máquinas',        render: async () => await renderMachines() },
    { id: 'supplies',  label: '📦 Insumos',          render: async () => await renderSupplies() },
    { id: 'processes', label: '⚙️ Procesos',         render: async () => await renderProcesses() },
  ];

  let activeTab = 'pricing';

  // Make container ready for loading states
  container.innerHTML = `
    <div class="admin-panel">
      <div class="admin-header">
        <h2><span class="icon">⚙️</span> Panel de Administración</h2>
        <p class="admin-subtitle">Administra precios, máquinas e insumos en tiempo real</p>
        <button id="btnReseed" style="margin-top:0.5rem;padding:0.4rem 0.9rem;background:rgba(245,124,0,0.15);border:1px solid rgba(245,124,0,0.4);border-radius:8px;color:var(--orange-light);font-size:0.82rem;cursor:pointer;">
          🔄 Re-poblar datos desde Excel
        </button>
      </div>
      <div class="admin-tabs" id="adminTabsMenu"></div>
      <div class="admin-content" id="adminContentArea">
        <div class="spinner"></div><p style="text-align:center">Cargando datos...</p>
      </div>
    </div>`;

  const tabsMenu = container.querySelector('#adminTabsMenu');
  const contentArea = container.querySelector('#adminContentArea');

  async function refresh() {
    await render();
    if (onDataChanged) onDataChanged();
  }

  async function render() {
    tabsMenu.innerHTML = tabs.map(t =>
      `<button class="admin-tab ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`
    ).join('');

    const activeTabObj = tabs.find(t => t.id === activeTab);
    contentArea.innerHTML = '<div class="spinner"></div>';
    
    if (activeTabObj) {
      const html = await activeTabObj.render();
      contentArea.innerHTML = html;
      bindAllActions(container, refresh);
    }

    tabsMenu.querySelectorAll('.admin-tab').forEach(btn => {
      btn.addEventListener('click', async () => { 
        activeTab = btn.dataset.tab; 
        await render(); 
      });
    });
  }

  await render();

  // Re-seed button
  container.querySelector('#btnReseed')?.addEventListener('click', async () => {
    if (!confirm('¿Re-poblar con los datos del Excel? Esto AGREGA datos (no borra los existentes). Usa esto solo si la base está vacía o incorrecta.')) return;
    const btn = container.querySelector('#btnReseed');
    btn.disabled = true; btn.textContent = '⏳ Poblando...';
    const { default: seedData } = await import('../db/seed-firestore.js');
    await seedData();
    btn.textContent = '✅ Listo';
    setTimeout(() => refresh(), 500);
  });
}

// ── Helpers ────────────────────────────────────────────────────

function fmt(n) { return typeof n === 'number' ? n.toLocaleString('es-CL') : n; }

/** Create an editable cell: shows value normally, becomes input when row is editing */
function editCell(value, fieldName, type = 'text', opts = {}) {
  const step = opts.step || (type === 'number' ? '0.1' : '');
  return `<td data-field="${fieldName}" data-value="${value ?? ''}">
    <span class="cell-display">${opts.displayValue ?? value ?? '-'}</span>
    <input class="cell-input hidden" type="${type}" name="${fieldName}" value="${value ?? ''}" ${step ? `step="${step}"` : ''} ${opts.required ? 'required' : ''} />
  </td>`;
}

function editSelect(value, fieldName, options) {
  const optionsHtml = options.map(o =>
    `<option value="${o.value}" ${o.value == value ? 'selected' : ''}>${o.label}</option>`
  ).join('');
  return `<td data-field="${fieldName}" data-value="${value ?? ''}">
    <span class="cell-display">${options.find(o => o.value == value)?.label ?? value}</span>
    <select class="cell-input hidden" name="${fieldName}">${optionsHtml}</select>
  </td>`;
}

// ── MACHINES ───────────────────────────────────────────────────

async function renderMachines() {
  const rows = await getMachines();
  rows.sort((a, b) => a.nombre.localeCompare(b.nombre));
  
  return `
    <div class="admin-section">
      <h3>Máquinas Registradas</h3>
      <table class="admin-table">
        <thead>
          <tr><th>Nombre</th><th>Papel Ancho</th><th>Papel Largo</th><th>Impr. Ancho</th><th>Impr. Largo</th><th>Plancha An.</th><th>Plancha La.</th><th></th></tr>
        </thead>
        <tbody>
          ${rows.map(r => `
          <tr data-row-id="${r.id}" data-table="machines">
            ${editCell(r.nombre, 'nombre', 'text', {required: true})}
            ${editCell(r.papel_ancho, 'papel_ancho', 'number', {displayValue: r.papel_ancho + ' cm'})}
            ${editCell(r.papel_largo, 'papel_largo', 'number', {displayValue: r.papel_largo + ' cm'})}
            ${editCell(r.impresion_ancho, 'impresion_ancho', 'number', {displayValue: r.impresion_ancho + ' cm'})}
            ${editCell(r.impresion_largo, 'impresion_largo', 'number', {displayValue: r.impresion_largo + ' cm'})}
            ${editCell(r.plancha_ancho, 'plancha_ancho', 'number', {displayValue: r.plancha_ancho + ' cm'})}
            ${editCell(r.plancha_largo, 'plancha_largo', 'number', {displayValue: r.plancha_largo + ' cm'})}
            <td class="action-cell">
              <button class="btn-icon-action btn-edit" data-action="edit" title="Editar">✏️</button>
              <button class="btn-icon-action btn-save hidden" data-action="save" title="Guardar">💾</button>
              <button class="btn-icon-action btn-cancel hidden" data-action="cancel" title="Cancelar">✖️</button>
              <button class="btn-icon-action btn-delete" data-action="delete" title="Eliminar">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
      <details class="admin-add-form">
        <summary class="btn-add">＋ Agregar Máquina</summary>
        <form data-form="add-machine" class="admin-form-grid">
          <div class="form-group"><label>Nombre</label><input name="nombre" required placeholder="Ej: GTO 4 Colores" /></div>
          <div class="form-group"><label>Papel Ancho</label><input name="papel_ancho" type="number" step="0.1" required /></div>
          <div class="form-group"><label>Papel Largo</label><input name="papel_largo" type="number" step="0.1" required /></div>
          <div class="form-group"><label>Impresión Ancho</label><input name="impresion_ancho" type="number" step="0.1" required /></div>
          <div class="form-group"><label>Impresión Largo</label><input name="impresion_largo" type="number" step="0.1" required /></div>
          <div class="form-group"><label>Plancha Ancho</label><input name="plancha_ancho" type="number" step="0.1" required /></div>
          <div class="form-group"><label>Plancha Largo</label><input name="plancha_largo" type="number" step="0.1" required /></div>
          <button type="submit" class="btn-submit">Guardar Máquina</button>
        </form>
      </details>
    </div>`;
}

// ── SUPPLIES ───────────────────────────────────────────────────

async function renderSupplies() {
  const rows = await getSupplies();
  rows.sort((a, b) => a.tipo_insumo.localeCompare(b.tipo_insumo) || a.nombre_insumo.localeCompare(b.nombre_insumo));
  
  const tipoOpts = [
    {value: 'Papel Interior', label: 'Papel Interior'},
    {value: 'Papel Tapa', label: 'Papel Tapa'},
    {value: 'Cartón Dúplex', label: 'Cartón Dúplex'},
  ];
  return `
    <div class="admin-section">
      <h3>Insumos (Papeles y Materiales)</h3>
      <table class="admin-table">
        <thead>
          <tr><th>Tipo</th><th>Nombre</th><th>Gramaje</th><th>Unid/Paq</th><th>Costo/Paq</th><th></th></tr>
        </thead>
        <tbody>
          ${rows.map(r => `
          <tr data-row-id="${r.id}" data-table="supplies">
            ${editSelect(r.tipo_insumo, 'tipo_insumo', tipoOpts)}
            ${editCell(r.nombre_insumo, 'nombre_insumo', 'text', {required: true})}
            ${editCell(r.gramaje, 'gramaje', 'number', {displayValue: (r.gramaje || '-') + 'g', step: '1'})}
            ${editCell(r.unidades_por_paquete, 'unidades_por_paquete', 'number', {step: '1'})}
            ${editCell(r.costo_paquete, 'costo_paquete', 'number', {displayValue: '$' + fmt(r.costo_paquete), step: '1'})}
            <td class="action-cell">
              <button class="btn-icon-action btn-edit" data-action="edit" title="Editar">✏️</button>
              <button class="btn-icon-action btn-save hidden" data-action="save" title="Guardar">💾</button>
              <button class="btn-icon-action btn-cancel hidden" data-action="cancel" title="Cancelar">✖️</button>
              <button class="btn-icon-action btn-delete" data-action="delete" title="Eliminar">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
      <details class="admin-add-form">
        <summary class="btn-add">＋ Agregar Insumo</summary>
        <form data-form="add-supply" class="admin-form-grid">
          <div class="form-group"><label>Tipo</label><select name="tipo_insumo" required>${tipoOpts.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}</select></div>
          <div class="form-group"><label>Nombre</label><input name="nombre_insumo" required placeholder="Ej: Bond Blanco" /></div>
          <div class="form-group"><label>Gramaje</label><input name="gramaje" type="number" placeholder="75" /></div>
          <div class="form-group"><label>Unid/Paquete</label><input name="unidades_por_paquete" type="number" value="500" required /></div>
          <div class="form-group"><label>Costo/Paquete ($)</label><input name="costo_paquete" type="number" required placeholder="25000" /></div>
          <button type="submit" class="btn-submit">Guardar Insumo</button>
        </form>
      </details>
    </div>`;
}

// ── PROCESSES ──────────────────────────────────────────────────

async function renderProcesses() {
  const rows = await getProcesses();
  rows.sort((a, b) => a.nombre.localeCompare(b.nombre));
  return `
    <div class="admin-section">
      <h3>Procesos</h3>
      <table class="admin-table">
        <thead><tr><th>Nombre</th><th></th></tr></thead>
        <tbody>
          ${rows.map(r => `
          <tr data-row-id="${r.id}" data-table="processes">
            ${editCell(r.nombre, 'nombre', 'text', {required: true})}
            <td class="action-cell">
              <button class="btn-icon-action btn-edit" data-action="edit" title="Editar">✏️</button>
              <button class="btn-icon-action btn-save hidden" data-action="save" title="Guardar">💾</button>
              <button class="btn-icon-action btn-cancel hidden" data-action="cancel" title="Cancelar">✖️</button>
              <button class="btn-icon-action btn-delete" data-action="delete" title="Eliminar">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
      <details class="admin-add-form">
        <summary class="btn-add">＋ Agregar Proceso</summary>
        <form data-form="add-process" class="admin-form-grid">
          <div class="form-group"><label>Nombre</label><input name="nombre" required placeholder="Ej: Troquelado" /></div>
          <button type="submit" class="btn-submit">Guardar Proceso</button>
        </form>
      </details>
    </div>`;
}

// ── VOLUME PRICING — Tabla tipo Excel ─────────────────────────

async function renderPricing() {
  const [rows, processes] = await Promise.all([getPricing(), getProcesses()]);

  // Tiers ordenados
  const tiers = [...new Set(rows.map(r => r.cantidad_minima))].sort((a, b) => a - b);

  // Lookup: { [proceso_nombre]: { [tier]: { id, valor } } }
  const lookup = {};
  rows.forEach(r => {
    const key = r.proceso; // getPricing() ya devuelve el nombre del proceso
    if (!lookup[key]) lookup[key] = {};
    lookup[key][r.cantidad_minima] = { id: r.id, valor: r.valor_aplicado };
  });

  // Orden lógico de procesos para la tabla (igual que el Excel)
  const ORDER = [
    'Impresión Tapa','Polilaminado Tapa','Cartón Piedra','Corte Tapa','Mano de Obra',
    'Impresión Papel Espejo','Papel Espejo','Polilaminado Espejo','Corte Espejo',
    'Impresión Intercalado','Corte Intercalado',
    'Impresión Interior','Planchas','Corte Interior','Anillo','Anillado',
    'Diseño','Delivery',
  ];
  const sorted = [
    ...ORDER.map(n => processes.find(p => p.nombre === n)).filter(Boolean),
    ...processes.filter(p => !ORDER.includes(p.nombre)).sort((a,b) => a.nombre.localeCompare(b.nombre)),
  ];

  const tierCols = tiers.map(t => `<th class="tier-col">${t}</th>`).join('');

  const bodyRows = sorted.map(proc => {
    const cells = tiers.map(tier => {
      const cell = lookup[proc.nombre]?.[tier];
      if (!cell) return `<td class="price-cell price-empty">—</td>`;
      return `<td class="price-cell" data-record-id="${cell.id}" data-orig="${cell.valor}">
        <span class="pcell-display">$${fmt(cell.valor)}</span>
        <input class="pcell-input hidden" type="number" value="${cell.valor}" min="0" step="1" />
      </td>`;
    }).join('');
    return `<tr><td class="proc-name">${proc.nombre}</td>${cells}</tr>`;
  }).join('');

  const procOptions = sorted.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

  return `
    <div class="admin-section">
      <div class="price-grid-header">
        <h3>Matriz de Precios — Costo Total por Lote</h3>
        <p class="admin-subtitle">
          Haz clic en un valor para editarlo.
          Para cantidades entre tiers, el sistema usa el tier inferior más cercano.
        </p>
      </div>
      <div class="price-grid-wrap">
        <table class="price-grid-table">
          <thead>
            <tr>
              <th class="proc-col">Proceso</th>
              ${tierCols}
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>

      <details class="admin-add-form" style="margin-top:1.5rem">
        <summary class="btn-add">＋ Agregar nuevo tier de cantidad</summary>
        <form data-form="add-pricing" class="admin-form-grid" style="margin-top:0.8rem">
          <div class="form-group">
            <label>Proceso</label>
            <select name="id_proceso" required>${procOptions}</select>
          </div>
          <div class="form-group">
            <label>Cantidad (tier)</label>
            <input name="cantidad_minima" type="number" required placeholder="Ej: 400" />
          </div>
          <div class="form-group">
            <label>Costo Total Lote ($)</label>
            <input name="valor_aplicado" type="number" required placeholder="Ej: 180000" />
          </div>
          <input type="hidden" name="cantidad_maxima" value="999999" />
          <button type="submit" class="btn-submit">Guardar</button>
        </form>
      </details>
    </div>`;
}

// ── ALL ACTION BINDINGS ───────────────────────────────────────

function bindAllActions(container, refresh) {
  // ── Price grid: clic en celda para editar ────────────────────
  container.querySelectorAll('.price-cell[data-record-id]').forEach(cell => {
    const display = cell.querySelector('.pcell-display');
    const input   = cell.querySelector('.pcell-input');

    cell.addEventListener('click', () => {
      if (input.classList.contains('hidden')) {
        display.classList.add('hidden');
        input.classList.remove('hidden');
        input.focus();
        input.select();
      }
    });

    const save = async () => {
      const newVal = parseInt(input.value, 10);
      const orig   = parseInt(cell.dataset.orig, 10);
      if (!isNaN(newVal) && newVal !== orig) {
        display.textContent = '⏳';
        await updatePricing(cell.dataset.recordId, { valor_aplicado: newVal });
        cell.dataset.orig = newVal;
      }
      display.textContent = '$' + fmt(parseInt(cell.dataset.orig, 10));
      input.classList.add('hidden');
      display.classList.remove('hidden');
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') {
        input.value = cell.dataset.orig;
        input.classList.add('hidden');
        display.classList.remove('hidden');
      }
    });
  });

  // ── Inline Edit / Save / Cancel ─────────────────────────────
  container.querySelectorAll('tr[data-row-id]').forEach(row => {
    const editBtn = row.querySelector('[data-action="edit"]');
    const saveBtn = row.querySelector('[data-action="save"]');
    const cancelBtn = row.querySelector('[data-action="cancel"]');
    const deleteBtn = row.querySelector('[data-action="delete"]');

    if (editBtn) {
      editBtn.addEventListener('click', () => enterEditMode(row));
    }
    if (saveBtn) {
      saveBtn.addEventListener('click', () => saveRow(row, refresh));
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => refresh());
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        const table = row.dataset.table;
        const id = row.dataset.rowId;
        if (confirm('¿Eliminar este registro?')) {
          const btn = deleteBtn; btn.disabled = true; btn.textContent = '⏳';
          if (table === 'machines') await deleteMachine(id);
          else if (table === 'supplies') await deleteSupply(id);
          else if (table === 'processes') await deleteProcess(id);
          else if (table === 'pricing') await deletePricing(id);
          refresh();
        }
      });
    }
  });

  // ── Add forms ───────────────────────────────────────────────
  bindForm(container, 'add-machine', async (d) => {
    await createMachine(d);
    refresh();
  });

  bindForm(container, 'add-supply', async (d) => {
    await createSupply(d);
    refresh();
  });

  bindForm(container, 'add-process', async (d) => {
    await createProcess(d);
    refresh();
  });

  bindForm(container, 'add-pricing', async (d) => {
    await createPricing(d);
    refresh();
  });
}

function enterEditMode(row) {
  row.classList.add('editing');
  row.querySelectorAll('.cell-display').forEach(el => el.classList.add('hidden'));
  row.querySelectorAll('.cell-input').forEach(el => el.classList.remove('hidden'));
  row.querySelector('.btn-edit')?.classList.add('hidden');
  row.querySelector('.btn-delete')?.classList.add('hidden');
  row.querySelector('.btn-save')?.classList.remove('hidden');
  row.querySelector('.btn-cancel')?.classList.remove('hidden');
  row.querySelector('.cell-input:not(.hidden)')?.focus();
}

async function saveRow(row, refresh) {
  const table = row.dataset.table;
  const id = row.dataset.rowId;
  const btn = row.querySelector('.btn-save');
  btn.disabled = true; btn.textContent = '⏳';

  const fields = {};
  row.querySelectorAll('td[data-field]').forEach(td => {
    const input = td.querySelector('.cell-input');
    if (input) fields[td.dataset.field] = input.value;
  });

  if (table === 'machines') await updateMachine(id, fields);
  else if (table === 'supplies') await updateSupply(id, fields);
  else if (table === 'processes') await updateProcess(id, fields);
  else if (table === 'pricing') await updatePricing(id, fields);

  refresh();
}

function bindForm(container, formName, handler) {
  const form = container.querySelector(`[data-form="${formName}"]`);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const origText = btn.textContent;
    btn.disabled = true; btn.textContent = 'Guardando...';
    try {
      await handler(Object.fromEntries(new FormData(form).entries()));
    } finally {
      btn.disabled = false; btn.textContent = origText;
    }
  });
}
