/**
 * form.js — Soporta Agenda, Talonario, Libro y Flyer.
 */

export function renderForm(container, allData, onSubmit) {
  const interiorPapers  = (allData.supplies || []).filter(s => s.tipo_insumo === 'Papel Interior');
  const tapaPapers      = (allData.supplies || []).filter(s => s.tipo_insumo === 'Papel Tapa');
  const talonarioPapers = (allData.supplies || []).filter(s => s.tipo_insumo === 'Papel Talonario');
  const defaultInterior = interiorPapers.find(p => p.gramaje === 75) || interiorPapers[0];
  const defaultTapa     = tapaPapers[0];

  const interiorOpts = interiorPapers.length > 0
    ? interiorPapers.map((p, i) => `<option value="${i}">${p.nombre_insumo} ${p.gramaje ? p.gramaje + 'gr' : ''}</option>`).join('')
    : `<option value="0">Sin datos — configurar en Precios</option>`;

  const tapaOpts = tapaPapers.length > 0
    ? tapaPapers.map((p, i) => `<option value="${i}">${p.nombre_insumo} ${p.gramaje ? p.gramaje + 'gr' : ''}</option>`).join('')
    : `<option value="0">Sin datos — configurar en Precios</option>`;

  container.innerHTML = `
    <form id="quoteForm" autocomplete="off">
      <h2>📋 Nueva Cotización</h2>

      <div class="product-toggle">
        <button type="button" class="prod-btn active" data-type="Agenda">📓 Agenda</button>
        <button type="button" class="prod-btn" data-type="Talonario">🗒️ Talonario</button>
        <button type="button" class="prod-btn" data-type="Libro">📚 Libro</button>
        <button type="button" class="prod-btn" data-type="Flyer">🗞️ Flyer</button>
      </div>

      <!-- ── AGENDA ─────────────────────────────────────────────── -->
      <div id="agendaFields">
        <div class="agenda-tag">📓 Agenda Media Carta — Tapa Dura Anillado B&N</div>
        <div class="form-group">
          <label for="quantity">Cantidad de agendas</label>
          <input type="number" id="quantity" min="1" value="100" />
        </div>
        <div class="form-group">
          <label for="interiorPages">Páginas interiores</label>
          <input type="number" id="interiorPages" min="4" step="2" value="100" />
        </div>
        <div class="form-group">
          <label for="piecesPerSheet">Piezas por pliego <span class="optional">(vacío = automático)</span></label>
          <input type="number" id="piecesPerSheet" min="1" placeholder="ej: 21" />
        </div>
      </div>

      <!-- ── TALONARIO ──────────────────────────────────────────── -->
      <div id="talonarioFields" style="display:none">
        <div class="form-row">
          <div class="form-group">
            <label for="talCantidad">Cantidad de talonarios</label>
            <input type="number" id="talCantidad" min="1" value="20" />
          </div>
          <div class="form-group">
            <label for="talJuegos">Juegos por talonario</label>
            <select id="talJuegos">
              <option value="50">50 juegos</option>
              <option value="100">100 juegos</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="talAncho">Ancho (cm)</label>
            <input type="number" id="talAncho" min="1" step="0.1" value="14.5" />
          </div>
          <div class="form-group">
            <label for="talLargo">Largo (cm)</label>
            <input type="number" id="talLargo" min="1" step="0.1" value="21.5" />
          </div>
        </div>
        <div class="form-group">
          <label for="talColores">Colores de impresión</label>
          <select id="talColores">
            <option value="1">1 Color</option>
            <option value="2">2 Colores</option>
            <option value="4">Full Color</option>
          </select>
        </div>
        <div class="form-group">
          <label for="talVias">Número de vías</label>
          <select id="talVias">
            <option value="1">Solo Original (1 vía)</option>
            <option value="2" selected>Original + Duplicado (2 vías)</option>
            <option value="3">Original + Duplicado + Triplicado (3 vías)</option>
          </select>
        </div>
        <div id="viasPapelSection"></div>
        <div class="form-group">
          <span class="section-label">Terminaciones</span>
          <div class="checkbox-grid">
            <label class="checkbox-item"><input type="checkbox" id="chkFolio" checked /><span>Folio (numeración)</span></label>
            <label class="checkbox-item"><input type="checkbox" id="chkPrepicado" /><span>Prepicado</span></label>
            <label class="checkbox-item"><input type="checkbox" id="chkCorchete" /><span>Corchete y Cinta</span></label>
            <label class="checkbox-item"><input type="checkbox" id="chkEngomado" checked /><span>Engomado</span></label>
            <label class="checkbox-item"><input type="checkbox" id="chkCartonBase" /><span>Cartón Base / Tapa</span></label>
          </div>
        </div>
      </div>

      <!-- ── LIBRO ──────────────────────────────────────────────── -->
      <div id="libroFields" style="display:none">
        <div class="form-row">
          <div class="form-group">
            <label for="libCantidad">Cantidad</label>
            <input type="number" id="libCantidad" min="1" value="500" />
          </div>
          <div class="form-group">
            <label for="libPaginas">Páginas interiores</label>
            <input type="number" id="libPaginas" min="4" step="2" value="100" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="libAncho">Ancho (cm)</label>
            <input type="number" id="libAncho" min="1" step="0.1" value="14" />
          </div>
          <div class="form-group">
            <label for="libLargo">Alto (cm)</label>
            <input type="number" id="libLargo" min="1" step="0.1" value="21" />
          </div>
        </div>
        <div class="form-group">
          <label for="libColores">Colores de impresión</label>
          <select id="libColores">
            <option value="1">1 Color</option>
            <option value="2">2 Colores</option>
            <option value="4" selected>Full Color</option>
          </select>
        </div>
        <div class="form-group">
          <label for="libPapelInterior">Papel interior</label>
          <select id="libPapelInterior">${interiorOpts}</select>
        </div>
        <div class="form-group">
          <label for="libPapelTapa">Papel tapa</label>
          <select id="libPapelTapa">${tapaOpts}</select>
        </div>
        <div class="form-group">
          <span class="section-label">Terminaciones</span>
          <div class="checkbox-grid">
            <label class="checkbox-item"><input type="checkbox" id="libLaminado" /><span>Laminado tapa</span></label>
            <label class="checkbox-item"><input type="checkbox" id="libEncuadernacion" checked /><span>Encuadernación</span></label>
          </div>
        </div>
        <div class="form-group" id="libTipoEncGroup">
          <label for="libTipoEnc">Tipo de encuadernación</label>
          <select id="libTipoEnc">
            <option value="Anillado">Anillado</option>
            <option value="Cosido">Cosido</option>
            <option value="Pegado">Pegado (Hot Melt)</option>
          </select>
        </div>
      </div>

      <!-- ── FLYER ───────────────────────────────────────────────── -->
      <div id="flyerFields" style="display:none">
        <div class="form-group">
          <label for="flyerCantidad">Cantidad</label>
          <input type="number" id="flyerCantidad" min="1" value="1000" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="flyerAncho">Ancho (cm)</label>
            <input type="number" id="flyerAncho" min="1" step="0.1" value="21" />
          </div>
          <div class="form-group">
            <label for="flyerLargo">Alto (cm)</label>
            <input type="number" id="flyerLargo" min="1" step="0.1" value="29.7" />
          </div>
        </div>
        <div class="form-group">
          <label for="flyerColores">Colores de impresión</label>
          <select id="flyerColores">
            <option value="1">1 Color</option>
            <option value="2">2 Colores</option>
            <option value="4" selected>Full Color</option>
          </select>
        </div>
        <div class="form-group">
          <label for="flyerPapel">Papel</label>
          <select id="flyerPapel">${interiorOpts}</select>
        </div>
        <div class="form-group">
          <div class="checkbox-grid">
            <label class="checkbox-item"><input type="checkbox" id="flyerLaminado" /><span>Laminado</span></label>
          </div>
        </div>
      </div>

      <!-- ── FLYER: laminado ────────────────────────────────────── -->

      <!-- ── OPCIONES COMPARTIDAS ───────────────────────────────── -->
      <div class="shared-options">
        <div class="form-group">
          <label for="marginPercent">Margen de Ganancia: <span id="marginValue">30</span>%</label>
          <input type="range" id="marginPercent" min="0" max="100" value="30" />
        </div>
        <div class="form-group">
          <label for="mermaPercent">Merma de papel: <span id="mermaValue">10</span>%</label>
          <input type="range" id="mermaPercent" min="5" max="20" value="10" />
        </div>
      </div>

      <button type="submit" id="submitBtn">
        <span class="btn-icon">⚡</span> Cotizar
      </button>
    </form>
  `;

  // ── Toggle producto ───────────────────────────────────────────
  let currentType = 'Agenda';
  const prodBtns        = container.querySelectorAll('.prod-btn');
  const allFieldDivs    = {
    Agenda:    container.querySelector('#agendaFields'),
    Talonario: container.querySelector('#talonarioFields'),
    Libro:     container.querySelector('#libroFields'),
    Flyer:     container.querySelector('#flyerFields'),
  };

  prodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentType = btn.dataset.type;
      prodBtns.forEach(b => b.classList.toggle('active', b === btn));
      Object.entries(allFieldDivs).forEach(([type, div]) => {
        div.style.display = type === currentType ? '' : 'none';
      });
    });
  });

  // ── Libro: mostrar/ocultar tipo encuadernación ────────────────
  const libEncCheck = container.querySelector('#libEncuadernacion');
  const libTipoEncGroup = container.querySelector('#libTipoEncGroup');
  libEncCheck.addEventListener('change', () => {
    libTipoEncGroup.style.display = libEncCheck.checked ? '' : 'none';
  });

  // ── Selectores de papel por vía (Talonario) ───────────────────
  const viaNames = ['Original', 'Duplicado', 'Triplicado'];

  function renderViasPapel(numVias) {
    const section = container.querySelector('#viasPapelSection');
    section.innerHTML = Array.from({ length: numVias }, (_, i) => `
      <div class="form-group">
        <label>Papel ${viaNames[i]}</label>
        <select id="talPapel${i}" class="via-papel-select">
          ${talonarioPapers.length > 0
            ? talonarioPapers.map((p, idx) => `<option value="${idx}" ${idx === i ? 'selected' : ''}>${p.nombre_insumo} ${p.gramaje}gr</option>`).join('')
            : `<option value="0">Sin datos — configurar en Precios</option>`
          }
        </select>
      </div>`).join('');
  }

  renderViasPapel(2);
  container.querySelector('#talVias').addEventListener('change', e => renderViasPapel(+e.target.value));

  // ── Sliders compartidos ───────────────────────────────────────
  const marginSlider = container.querySelector('#marginPercent');
  container.querySelector('#marginValue').textContent = marginSlider.value;
  marginSlider.addEventListener('input', () => {
    container.querySelector('#marginValue').textContent = marginSlider.value;
  });

  const mermaSlider = container.querySelector('#mermaPercent');
  container.querySelector('#mermaValue').textContent = mermaSlider.value;
  mermaSlider.addEventListener('input', () => {
    container.querySelector('#mermaValue').textContent = mermaSlider.value;
  });

  // ── Validación ────────────────────────────────────────────────
  function showError(inputId, msg) {
    const el = container.querySelector(`#${inputId}`);
    if (!el) return;
    el.classList.add('input-error');
    let err = el.parentElement.querySelector('.field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error';
      el.parentElement.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearErrors() {
    container.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    container.querySelectorAll('.field-error').forEach(el => el.remove());
  }

  function validatePositiveInt(inputId, label, min = 1) {
    const val = parseInt(container.querySelector(`#${inputId}`)?.value, 10);
    if (isNaN(val) || val < min) {
      showError(inputId, `${label} debe ser mayor a ${min - 1}.`);
      return false;
    }
    return true;
  }

  function validatePositiveFloat(inputId, label) {
    const val = parseFloat(container.querySelector(`#${inputId}`)?.value);
    if (isNaN(val) || val <= 0) {
      showError(inputId, `${label} debe ser mayor a 0.`);
      return false;
    }
    return true;
  }

  // ── Submit ────────────────────────────────────────────────────
  container.querySelector('#quoteForm').addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    const marginPercent = parseFloat(marginSlider.value);
    const mermaPercent  = parseFloat(mermaSlider.value);

    if (currentType === 'Agenda') {
      const ok = validatePositiveInt('quantity', 'Cantidad', 1)
               & validatePositiveInt('interiorPages', 'Páginas interiores', 2);
      const pagesVal = parseInt(container.querySelector('#interiorPages').value, 10);
      if (!isNaN(pagesVal) && pagesVal % 2 !== 0) {
        showError('interiorPages', 'Las páginas deben ser un número par.');
        return;
      }
      if (!ok) return;

      const manualPieces = parseInt(container.querySelector('#piecesPerSheet').value, 10);
      onSubmit({
        productType:             'Agenda',
        quantity:                parseInt(container.querySelector('#quantity').value, 10),
        pieceWidth:              14,
        pieceHeight:             21.6,
        interiorPages:           parseInt(container.querySelector('#interiorPages').value, 10),
        manualPiecesPerSheet:    isNaN(manualPieces) ? null : manualPieces,
        interiorPaperCost:       defaultInterior?.costo_paquete || 25000,
        interiorUnitsPerPackage: defaultInterior?.unidades_por_paquete || 500,
        interiorSupplyId:        defaultInterior?.id || null,
        coverPaperCost:          0,
        coverUnitsPerPackage:    100,
        numColors:               4,
        mermaPercent,
        hasLamination:           false,
        hasBinding:              false,
        bindingType:             'Anillado',
        marginPercent,
      });

    } else if (currentType === 'Talonario') {
      const ok = validatePositiveInt('talCantidad', 'Cantidad', 1)
               & validatePositiveFloat('talAncho', 'Ancho')
               & validatePositiveFloat('talLargo', 'Largo');
      if (!ok) return;

      const numVias = parseInt(container.querySelector('#talVias').value, 10);
      const vias = Array.from({ length: numVias }, (_, i) => {
        const idx   = parseInt(container.querySelector(`#talPapel${i}`)?.value || '0', 10);
        const papel = talonarioPapers[idx] || { costo_paquete: 22000, unidades_por_paquete: 500, nombre_insumo: viaNames[i] };
        return { nombre: viaNames[i], papel };
      });

      onSubmit({
        productType:        'Talonario',
        quantity:           parseInt(container.querySelector('#talCantidad').value, 10),
        juegosPerTalonario: parseInt(container.querySelector('#talJuegos').value, 10),
        pieceWidth:         parseFloat(container.querySelector('#talAncho').value),
        pieceHeight:        parseFloat(container.querySelector('#talLargo').value),
        numColors:          parseInt(container.querySelector('#talColores').value, 10),
        vias,
        terminaciones: {
          folio:          container.querySelector('#chkFolio').checked,
          prepicado:      container.querySelector('#chkPrepicado').checked,
          corcheteYCinta: container.querySelector('#chkCorchete').checked,
          engomado:       container.querySelector('#chkEngomado').checked,
          cartonBase:     container.querySelector('#chkCartonBase').checked,
        },
        mermaPercent,
        marginPercent,
      });

    } else if (currentType === 'Libro') {
      const ok = validatePositiveInt('libCantidad', 'Cantidad', 1)
               & validatePositiveInt('libPaginas', 'Páginas interiores', 2)
               & validatePositiveFloat('libAncho', 'Ancho')
               & validatePositiveFloat('libLargo', 'Alto');
      const libPagVal = parseInt(container.querySelector('#libPaginas').value, 10);
      if (!isNaN(libPagVal) && libPagVal % 2 !== 0) {
        showError('libPaginas', 'Las páginas deben ser un número par.');
        return;
      }
      if (!ok) return;

      const interiorIdx = parseInt(container.querySelector('#libPapelInterior').value, 10);
      const tapaIdx     = parseInt(container.querySelector('#libPapelTapa').value, 10);
      const interior    = interiorPapers[interiorIdx] || { costo_paquete: 25000, unidades_por_paquete: 500 };
      const tapa        = tapaPapers[tapaIdx]         || { costo_paquete: 55000, unidades_por_paquete: 100 };
      const hasBinding  = container.querySelector('#libEncuadernacion').checked;

      onSubmit({
        productType:             'Libro',
        quantity:                parseInt(container.querySelector('#libCantidad').value, 10),
        pieceWidth:              parseFloat(container.querySelector('#libAncho').value),
        pieceHeight:             parseFloat(container.querySelector('#libLargo').value),
        interiorPages:           parseInt(container.querySelector('#libPaginas').value, 10),
        numColors:               parseInt(container.querySelector('#libColores').value, 10),
        interiorPaperCost:       interior.costo_paquete,
        interiorUnitsPerPackage: interior.unidades_por_paquete,
        interiorSupplyId:        interior.id || null,
        coverPaperCost:          tapa.costo_paquete,
        coverUnitsPerPackage:    tapa.unidades_por_paquete,
        coverSupplyId:           tapa.id || null,
        hasLamination:           container.querySelector('#libLaminado').checked,
        hasBinding,
        bindingType:             hasBinding ? container.querySelector('#libTipoEnc').value : 'Anillado',
        bindingProcessId:        hasBinding ? container.querySelector('#libTipoEnc').value : null,
        mermaPercent,
        marginPercent,
      });

    } else if (currentType === 'Flyer') {
      const ok = validatePositiveInt('flyerCantidad', 'Cantidad', 1)
               & validatePositiveFloat('flyerAncho', 'Ancho')
               & validatePositiveFloat('flyerLargo', 'Alto');
      if (!ok) return;

      const flyerIdx = parseInt(container.querySelector('#flyerPapel').value, 10);
      const flyerPapel = interiorPapers[flyerIdx] || { costo_paquete: 25000, unidades_por_paquete: 500 };

      onSubmit({
        productType:             'Flyer',
        quantity:                parseInt(container.querySelector('#flyerCantidad').value, 10),
        pieceWidth:              parseFloat(container.querySelector('#flyerAncho').value),
        pieceHeight:             parseFloat(container.querySelector('#flyerLargo').value),
        numColors:               parseInt(container.querySelector('#flyerColores').value, 10),
        interiorPaperCost:       flyerPapel.costo_paquete,
        interiorUnitsPerPackage: flyerPapel.unidades_por_paquete,
        interiorSupplyId:        flyerPapel.id || null,
        hasLamination:           container.querySelector('#flyerLaminado').checked,
        hasBinding:              false,
        mermaPercent,
        marginPercent,
      });
    }
  });
}
