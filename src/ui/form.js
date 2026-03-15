/**
 * form.js — V2: Dynamic quotation form with margin slider.
 * Adapted for Firebase data object.
 */

export function renderForm(container, allData, onSubmit) {
  const supplies = allData.supplies || [];
  const papers = supplies.filter(s => s.tipo_insumo === 'Papel Interior');
  const covers = supplies.filter(s => s.tipo_insumo === 'Papel Tapa');

  const paperOptions = papers
    .map((p) => `<option value="${p.costo_paquete}" data-units="${p.unidades_por_paquete}">${p.nombre_insumo} ${p.gramaje}g — $${p.costo_paquete.toLocaleString()}/${p.unidades_por_paquete} hojas</option>`)
    .join('');

  const coverOptions = covers
    .map((p) => `<option value="${p.costo_paquete}" data-units="${p.unidades_por_paquete}">${p.nombre_insumo} ${p.gramaje}g — $${p.costo_paquete.toLocaleString()}/${p.unidades_por_paquete} hojas</option>`)
    .join('');

  container.innerHTML = `
    <form id="quoteForm" autocomplete="off">
      <h2><span class="icon">📋</span> Nueva Cotización</h2>

      <!-- Product Type -->
      <div class="form-group">
        <label for="productType">Tipo de Producto</label>
        <select id="productType" required>
          <option value="">Seleccionar...</option>
          <option value="Libro">📖 Libro</option>
          <option value="Agenda">📓 Agenda / Cuaderno</option>
          <option value="Flyer">📄 Flyer / Volante</option>
        </select>
      </div>

      <!-- Basic dimensions -->
      <div class="form-row">
        <div class="form-group">
          <label for="quantity">Cantidad</label>
          <input type="number" id="quantity" min="1" value="100" required />
        </div>
        <div class="form-group">
          <label for="pieceWidth">Ancho (cm)</label>
          <input type="number" id="pieceWidth" min="1" step="0.1" value="14" required />
        </div>
        <div class="form-group">
          <label for="pieceHeight">Largo (cm)</label>
          <input type="number" id="pieceHeight" min="1" step="0.1" value="21" required />
        </div>
      </div>

      <!-- INTERIOR section (editorial only) -->
      <div id="interiorSection" class="section hidden">
        <h3><span class="icon">📄</span> Interior</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="interiorPages">Páginas Interiores</label>
            <input type="number" id="interiorPages" min="4" step="2" value="100" />
          </div>
          <div class="form-group">
            <label for="interiorPaper">Papel Interior</label>
            <select id="interiorPaper">
              ${paperOptions}
            </select>
          </div>
        </div>
      </div>

      <!-- COVER section (editorial only) -->
      <div id="coverSection" class="section hidden">
        <h3><span class="icon">🎨</span> Tapa / Cubierta</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="coverPaper">Material de Tapa</label>
            <select id="coverPaper">
              ${coverOptions}
            </select>
          </div>
        </div>
        <div class="form-row checkboxes">
          <label class="checkbox-label">
            <input type="checkbox" id="hasLamination" />
            <span>Laminado</span>
          </label>
        </div>
      </div>

      <!-- FLYER paper (flyers only) -->
      <div id="flyerSection" class="section hidden">
        <h3><span class="icon">📄</span> Papel</h3>
        <div class="form-group">
          <label for="flyerPaper">Tipo de Papel</label>
          <select id="flyerPaper">
            ${paperOptions}
          </select>
        </div>
      </div>

      <!-- Finishing (editorial only) -->
      <div id="finishingSection" class="section hidden">
        <h3><span class="icon">🔧</span> Terminaciones</h3>
        <div class="form-row checkboxes">
          <label class="checkbox-label">
            <input type="checkbox" id="hasBinding" />
            <span>Encuadernación</span>
          </label>
        </div>
        <div id="bindingTypeGroup" class="form-group hidden">
          <label for="bindingType">Tipo de Encuadernación</label>
          <select id="bindingType">
            <option value="Anillado">Anillado</option>
            <option value="Encuadernación">Encuadernación / Encolado</option>
            <option value="Engomado">Engomado</option>
          </select>
        </div>
      </div>

      <!-- Colors, Merma & Margin -->
      <div class="form-row">
        <div class="form-group">
          <label for="numColors">Tintas (colores)</label>
          <select id="numColors">
            <option value="1">1 (Solo negro)</option>
            <option value="2">2 colores</option>
            <option value="4" selected>4 (CMYK Full Color)</option>
          </select>
        </div>
        <div class="form-group">
          <label for="mermaPercent">Merma (%)</label>
          <input type="number" id="mermaPercent" min="0" max="30" value="10" />
        </div>
      </div>

      <!-- Margin -->
      <div class="form-group">
        <label for="marginPercent">Margen de Ganancia: <span id="marginValue">30</span>%</label>
        <input type="range" id="marginPercent" min="0" max="100" value="30" />
      </div>

      <button type="submit" id="submitBtn">
        <span class="btn-icon">⚡</span> Cotizar
      </button>
    </form>
  `;

  // ── Dynamic section visibility ──────────────────────────────
  const productSelect = container.querySelector('#productType');
  const interiorSection = container.querySelector('#interiorSection');
  const coverSection = container.querySelector('#coverSection');
  const flyerSection = container.querySelector('#flyerSection');
  const finishingSection = container.querySelector('#finishingSection');
  const bindingCheckbox = container.querySelector('#hasBinding');
  const bindingTypeGroup = container.querySelector('#bindingTypeGroup');
  const marginSlider = container.querySelector('#marginPercent');
  const marginValueDisplay = container.querySelector('#marginValue');

  productSelect.addEventListener('change', () => {
    const type = productSelect.value;
    const isEditorial = type === 'Libro' || type === 'Agenda';

    interiorSection.classList.toggle('hidden', !isEditorial);
    coverSection.classList.toggle('hidden', !isEditorial);
    finishingSection.classList.toggle('hidden', !isEditorial);
    flyerSection.classList.toggle('hidden', isEditorial || !type);
  });

  bindingCheckbox.addEventListener('change', () => {
    bindingTypeGroup.classList.toggle('hidden', !bindingCheckbox.checked);
  });

  marginSlider.addEventListener('input', () => {
    marginValueDisplay.textContent = marginSlider.value;
  });

  // ── Form submission ─────────────────────────────────────────
  container.querySelector('#quoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const type = productSelect.value;
    const isEditorial = type === 'Libro' || type === 'Agenda';

    const interiorSelect = document.getElementById('interiorPaper');
    const coverSelect = document.getElementById('coverPaper');
    const flyerSelect = document.getElementById('flyerPaper');

    const data = {
      productType: type,
      quantity: parseInt(document.getElementById('quantity').value, 10),
      pieceWidth: parseFloat(document.getElementById('pieceWidth').value),
      pieceHeight: parseFloat(document.getElementById('pieceHeight').value),
      numColors: parseInt(document.getElementById('numColors').value, 10),
      mermaPercent: parseFloat(document.getElementById('mermaPercent').value),
      marginPercent: parseFloat(marginSlider.value),
      interiorPages: isEditorial ? parseInt(document.getElementById('interiorPages').value, 10) : 0,
      interiorPaperCost: isEditorial
        ? parseFloat(interiorSelect.value)
        : parseFloat(flyerSelect?.value || 25000),
      interiorUnitsPerPackage: isEditorial
        ? parseInt(interiorSelect.selectedOptions[0]?.dataset.units || 500, 10)
        : parseInt(flyerSelect?.selectedOptions[0]?.dataset.units || 500, 10),
      coverPaperCost: isEditorial ? parseFloat(coverSelect.value) : 0,
      coverUnitsPerPackage: isEditorial
        ? parseInt(coverSelect.selectedOptions[0]?.dataset.units || 100, 10)
        : 100,
      hasLamination: isEditorial ? document.getElementById('hasLamination').checked : false,
      hasBinding: isEditorial ? document.getElementById('hasBinding').checked : false,
      bindingType: isEditorial ? document.getElementById('bindingType').value : '',
    };

    onSubmit(data);
  });
}
