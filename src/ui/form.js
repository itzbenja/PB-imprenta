/**
 * form.js — Agenda Media Carta Tapa Dura Anillado Interior B&N
 * Formulario simplificado: solo Cantidad, Páginas y Margen.
 */

export function renderForm(container, allData, onSubmit) {
  // Paper interior fijo: Bond 75g (primer papel interior disponible, o default 25000)
  const papers = (allData.supplies || []).filter(s => s.tipo_insumo === 'Papel Interior');
  const defaultPaper = papers.find(p => p.gramaje === 75) || papers[0];
  const paperCosto   = defaultPaper?.costo_paquete || 25000;
  const paperUnits   = defaultPaper?.unidades_por_paquete || 500;

  container.innerHTML = `
    <form id="quoteForm" autocomplete="off">
      <h2><span class="icon">📋</span> Nueva Cotización</h2>

      <div class="agenda-tag">📓 Agenda Media Carta — Tapa Dura Anillado B&N</div>

      <div class="form-group">
        <label for="quantity">Cantidad de agendas</label>
        <input type="number" id="quantity" min="1" value="100" required />
      </div>

      <div class="form-group">
        <label for="interiorPages">Páginas interiores</label>
        <input type="number" id="interiorPages" min="4" step="2" value="100" />
      </div>

      <div class="form-group">
        <label for="piecesPerSheet">Piezas por pliego <span class="optional">(dejar vacío = automático)</span></label>
        <input type="number" id="piecesPerSheet" min="1" placeholder="ej: 21" />
      </div>

      <div class="form-group">
        <label for="marginPercent">Margen de Ganancia: <span id="marginValue">30</span>%</label>
        <input type="range" id="marginPercent" min="0" max="100" value="30" />
      </div>

      <button type="submit" id="submitBtn">
        <span class="btn-icon">⚡</span> Cotizar
      </button>
    </form>
  `;

  // Slider margen
  const marginSlider = container.querySelector('#marginPercent');
  container.querySelector('#marginValue').textContent = marginSlider.value;
  marginSlider.addEventListener('input', () => {
    container.querySelector('#marginValue').textContent = marginSlider.value;
  });

  // Submit
  container.querySelector('#quoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const manualPieces = parseInt(document.getElementById('piecesPerSheet').value, 10);
    onSubmit({
      productType:           'Agenda',
      quantity:              parseInt(document.getElementById('quantity').value, 10),
      pieceWidth:            14,
      pieceHeight:           21.6,
      interiorPages:         parseInt(document.getElementById('interiorPages').value, 10),
      manualPiecesPerSheet:  isNaN(manualPieces) ? null : manualPieces,
      interiorPaperCost:     paperCosto,
      interiorUnitsPerPackage: paperUnits,
      coverPaperCost:        0,
      coverUnitsPerPackage:  100,
      numColors:             4,
      mermaPercent:          10,
      hasLamination:         false,
      hasBinding:            false,
      bindingType:           'Anillado',
      marginPercent:         parseFloat(marginSlider.value),
    });
  });
}
