/**
 * seed-firestore.js
 * Insumos con precios reales de listas Walter Lund SPA / JHE (Feb 2023)
 * Precios = Neto con 2% descuento efectivo/transferencia (sin IVA)
 * valor_aplicado en pricing = costo TOTAL del lote para ese tier de cantidad
 */

import {
  createMachine, createSupply, createProcess, createPricing,
  getMachines, getSupplies, getProcesses, getPricing,
  deleteMachine, deleteSupply, deleteProcess, deletePricing,
} from './firestore-api.js';

async function clearCollection(getAll, deleteOne) {
  const items = await getAll();
  await Promise.all(items.map(item => deleteOne(item.id)));
}

export default async function seedData() {
  console.log('🌱 Limpiando datos anteriores...');
  await clearCollection(getMachines,  deleteMachine);
  await clearCollection(getSupplies,  deleteSupply);
  await clearCollection(getProcesses, deleteProcess);
  const pricing = await getPricing();
  await Promise.all(pricing.map(p => deletePricing(p.id)));
  console.log('✅ Colecciones limpias. Poblando datos...');
  try {

    // ── Machines ─────────────────────────────────────────────────
    const machines = [
      { nombre: 'Formato Grande', papel_ancho: 102, papel_largo: 72, impresion_ancho: 100, impresion_largo: 70, plancha_ancho: 102, plancha_largo: 72 },
      { nombre: 'ZOR MZ',         papel_ancho: 72,  papel_largo: 51, impresion_ancho: 70,  impresion_largo: 50, plancha_ancho: 72.5, plancha_largo: 61 },

      { nombre: 'GTO 4 Colores',  papel_ancho: 52,  papel_largo: 36, impresion_ancho: 51,  impresion_largo: 34, plancha_ancho: 51,  plancha_largo: 40 },
      { nombre: 'Máquina 70x50',  papel_ancho: 70,  papel_largo: 50, impresion_ancho: 68,  impresion_largo: 48, plancha_ancho: 70,  plancha_largo: 50 },
      { nombre: 'Máquina 100x60', papel_ancho: 100, papel_largo: 60, impresion_ancho: 98,  impresion_largo: 58, plancha_ancho: 100, plancha_largo: 60 },
    ];
    for (const m of machines) await createMachine(m);

    // ── Supplies ─────────────────────────────────────────────────
    // Precios: Lista N°10 Walter Lund SPA / JHE — Febrero 2023
    // costo_paquete = precio neto con 2% dcto efectivo/transferencia (sin IVA)
    const supplies = [

      // ══════════════════════════════════════════════════════════
      // PAPEL TALONARIO — Autocopiativo JHE
      // Lista 10-01 B: Resmas Gramaje Superior (60-55-60)
      // ══════════════════════════════════════════════════════════

      // -- Formato 77x110 --
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CB Blanco',   formato: '77x110', tipo_papel: 'CB',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 60088 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Blanco',  formato: '77x110', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 62050 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Amarillo',formato: '77x110', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 63046 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Rosado',  formato: '77x110', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 63046 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Celeste', formato: '77x110', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 63046 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Verde',   formato: '77x110', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 63046 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Blanco',   formato: '77x110', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 53076 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Amarillo', formato: '77x110', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 54493 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Rosado',   formato: '77x110', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 54493 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Celeste',  formato: '77x110', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 54493 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Verde',    formato: '77x110', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 54493 },

      // -- Formato 77x110 Gramajes Especiales --
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CB Blanco 80g',  formato: '77x110', tipo_papel: 'CB', gramaje: 80,  unidades_por_paquete: 250, costo_paquete: 55465 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Blanco 80g',  formato: '77x110', tipo_papel: 'CF', gramaje: 80,  unidades_por_paquete: 250, costo_paquete: 79448 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Blanco 110g', formato: '77x110', tipo_papel: 'CF', gramaje: 110, unidades_por_paquete: 250, costo_paquete: 94634 },

      // -- Formato 66x88 --
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CB Blanco',   formato: '66x88', tipo_papel: 'CB',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 41372 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Blanco',  formato: '66x88', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 42515 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Amarillo',formato: '66x88', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 42627 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Rosado',  formato: '66x88', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 42627 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Celeste', formato: '66x88', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 42627 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Verde',   formato: '66x88', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 42627 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Blanco',   formato: '66x88', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 36746 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Amarillo', formato: '66x88', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 37921 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Rosado',   formato: '66x88', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 37921 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Celeste',  formato: '66x88', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 37921 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Verde',    formato: '66x88', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 37921 },

      // -- Formato 56x88 --
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CB Blanco',   formato: '56x88', tipo_papel: 'CB',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 35031 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Blanco',  formato: '56x88', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 35807 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Amarillo',formato: '56x88', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 36166 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Rosado',  formato: '56x88', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 36166 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Celeste', formato: '56x88', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 36166 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Verde',   formato: '56x88', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 36166 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Blanco',   formato: '56x88', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 31026 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Amarillo', formato: '56x88', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 31648 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Rosado',   formato: '56x88', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 31648 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Celeste',  formato: '56x88', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 31648 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Verde',    formato: '56x88', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 31648 },

      // Lista 10-02: Paquetes Carta — Gramaje Normal (55-50-55)
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CB Blanco',   formato: 'Carta', tipo_papel: 'CB',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 4597 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Blanco',  formato: 'Carta', tipo_papel: 'CFB', gramaje: 50, unidades_por_paquete: 500, costo_paquete: 4622 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Amarillo',formato: 'Carta', tipo_papel: 'CFB', gramaje: 50, unidades_por_paquete: 500, costo_paquete: 4632 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Rosado',  formato: 'Carta', tipo_papel: 'CFB', gramaje: 50, unidades_por_paquete: 500, costo_paquete: 4632 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Celeste', formato: 'Carta', tipo_papel: 'CFB', gramaje: 50, unidades_por_paquete: 500, costo_paquete: 4632 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Verde',   formato: 'Carta', tipo_papel: 'CFB', gramaje: 50, unidades_por_paquete: 500, costo_paquete: 4632 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Blanco',   formato: 'Carta', tipo_papel: 'CF',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 3911 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Amarillo', formato: 'Carta', tipo_papel: 'CF',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 3937 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Rosado',   formato: 'Carta', tipo_papel: 'CF',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 3937 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Celeste',  formato: 'Carta', tipo_papel: 'CF',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 3937 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Verde',    formato: 'Carta', tipo_papel: 'CF',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 3937 },

      // Lista 10-02: Paquetes Carta — Gramaje Superior (60-55-60)
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CB Blanco Sup',   formato: 'Carta', tipo_papel: 'CB',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 5099 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Blanco Sup',  formato: 'Carta', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 5130 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Amarillo Sup',formato: 'Carta', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 5143 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Rosado Sup',  formato: 'Carta', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 5143 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Celeste Sup', formato: 'Carta', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 5143 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Verde Sup',   formato: 'Carta', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 5143 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Blanco Sup',   formato: 'Carta', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 4339 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Amarillo Sup', formato: 'Carta', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 4371 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Rosado Sup',   formato: 'Carta', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 4371 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Celeste Sup',  formato: 'Carta', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 4371 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Verde Sup',    formato: 'Carta', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 4371 },

      // Lista 10-02: Paquetes Oficio — Gramaje Normal (55-50-55)
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CB Blanco',   formato: 'Oficio', tipo_papel: 'CB',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 5512 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Blanco',  formato: 'Oficio', tipo_papel: 'CFB', gramaje: 50, unidades_por_paquete: 500, costo_paquete: 5544 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Amarillo',formato: 'Oficio', tipo_papel: 'CFB', gramaje: 50, unidades_por_paquete: 500, costo_paquete: 5557 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Rosado',  formato: 'Oficio', tipo_papel: 'CFB', gramaje: 50, unidades_por_paquete: 500, costo_paquete: 5557 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Celeste', formato: 'Oficio', tipo_papel: 'CFB', gramaje: 50, unidades_por_paquete: 500, costo_paquete: 5557 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Verde',   formato: 'Oficio', tipo_papel: 'CFB', gramaje: 50, unidades_por_paquete: 500, costo_paquete: 5557 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Blanco',   formato: 'Oficio', tipo_papel: 'CF',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 4702 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Amarillo', formato: 'Oficio', tipo_papel: 'CF',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 4852 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Rosado',   formato: 'Oficio', tipo_papel: 'CF',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 4852 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Celeste',  formato: 'Oficio', tipo_papel: 'CF',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 4852 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Verde',    formato: 'Oficio', tipo_papel: 'CF',  gramaje: 55, unidades_por_paquete: 500, costo_paquete: 4852 },

      // Lista 10-02: Paquetes Oficio — Gramaje Superior (60-55-60)
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CB Blanco Sup',   formato: 'Oficio', tipo_papel: 'CB',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 6119 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Blanco Sup',  formato: 'Oficio', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 6154 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Amarillo Sup',formato: 'Oficio', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 6169 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Rosado Sup',  formato: 'Oficio', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 6169 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Celeste Sup', formato: 'Oficio', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 6169 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CFB Verde Sup',   formato: 'Oficio', tipo_papel: 'CFB', gramaje: 55, unidades_por_paquete: 500, costo_paquete: 6169 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Blanco Sup',   formato: 'Oficio', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 5220 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Amarillo Sup', formato: 'Oficio', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 5385 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Rosado Sup',   formato: 'Oficio', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 5385 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Celeste Sup',  formato: 'Oficio', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 5385 },
      { tipo_insumo: 'Papel Talonario', nombre_insumo: 'Autocopia CF Verde Sup',    formato: 'Oficio', tipo_papel: 'CF',  gramaje: 60, unidades_por_paquete: 500, costo_paquete: 5385 },

      // ══════════════════════════════════════════════════════════
      // PAPEL INTERIOR — Bond Blanco (Lista 10-04)
      // ══════════════════════════════════════════════════════════

      // -- 77x110 --
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 55g', formato: '77x110', tipo_papel: null, gramaje: 55,  unidades_por_paquete: 500, costo_paquete: 35033 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 60g', formato: '77x110', tipo_papel: null, gramaje: 60,  unidades_por_paquete: 500, costo_paquete: 40348 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 70g', formato: '77x110', tipo_papel: null, gramaje: 70,  unidades_por_paquete: 500, costo_paquete: 45357 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 75g', formato: '77x110', tipo_papel: null, gramaje: 75,  unidades_por_paquete: 250, costo_paquete: 24300 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 80g', formato: '77x110', tipo_papel: null, gramaje: 80,  unidades_por_paquete: 250, costo_paquete: 25918 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 90g', formato: '77x110', tipo_papel: null, gramaje: 90,  unidades_por_paquete: 250, costo_paquete: 29162 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 105g',formato: '77x110', tipo_papel: null, gramaje: 105, unidades_por_paquete: 250, costo_paquete: 34004 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 140g',formato: '77x110', tipo_papel: null, gramaje: 140, unidades_por_paquete: 250, costo_paquete: 45345 },

      // -- 66x88 --
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 60g', formato: '66x88', tipo_papel: null, gramaje: 60,  unidades_por_paquete: 500, costo_paquete: 27668 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 70g', formato: '66x88', tipo_papel: null, gramaje: 70,  unidades_por_paquete: 500, costo_paquete: 31099 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 75g', formato: '66x88', tipo_papel: null, gramaje: 75,  unidades_por_paquete: 500, costo_paquete: 33323 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 80g', formato: '66x88', tipo_papel: null, gramaje: 80,  unidades_por_paquete: 500, costo_paquete: 35541 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 90g', formato: '66x88', tipo_papel: null, gramaje: 90,  unidades_por_paquete: 500, costo_paquete: 39991 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 105g',formato: '66x88', tipo_papel: null, gramaje: 105, unidades_por_paquete: 250, costo_paquete: 23326 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 140g',formato: '66x88', tipo_papel: null, gramaje: 140, unidades_por_paquete: 250, costo_paquete: 31101 },

      // -- 56x88 --
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 70g', formato: '56x88', tipo_papel: null, gramaje: 70,  unidades_por_paquete: 500, costo_paquete: 26392 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 75g', formato: '56x88', tipo_papel: null, gramaje: 75,  unidades_por_paquete: 500, costo_paquete: 28282 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 80g', formato: '56x88', tipo_papel: null, gramaje: 80,  unidades_por_paquete: 500, costo_paquete: 30160 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 90g', formato: '56x88', tipo_papel: null, gramaje: 90,  unidades_por_paquete: 500, costo_paquete: 33915 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 105g',formato: '56x88', tipo_papel: null, gramaje: 105, unidades_por_paquete: 250, costo_paquete: 19805 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 140g',formato: '56x88', tipo_papel: null, gramaje: 140, unidades_por_paquete: 250, costo_paquete: 26384 },

      // -- Formatos especiales --
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 80g', formato: '90x60',    tipo_papel: null, gramaje: 80,  unidades_por_paquete: 500, costo_paquete: 33056 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 80g', formato: '91.4x60',  tipo_papel: null, gramaje: 80,  unidades_por_paquete: 500, costo_paquete: 33570 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 80g', formato: '66x96',    tipo_papel: null, gramaje: 80,  unidades_por_paquete: 500, costo_paquete: 38785 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 80g', formato: '72x102',   tipo_papel: null, gramaje: 80,  unidades_por_paquete: 250, costo_paquete: 22478 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 90g', formato: '72x102',   tipo_papel: null, gramaje: 90,  unidades_por_paquete: 250, costo_paquete: 25287 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco 105g',formato: '72x102',   tipo_papel: null, gramaje: 105, unidades_por_paquete: 250, costo_paquete: 29483 },

      // ══════════════════════════════════════════════════════════
      // PAPEL INTERIOR — Bond Ahuesado (Lista 10-03)
      // ══════════════════════════════════════════════════════════
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Ahuesado 78g', formato: '66x88',  tipo_papel: null, gramaje: 78, unidades_por_paquete: 500, costo_paquete: 37772 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Ahuesado 78g', formato: '66x96',  tipo_papel: null, gramaje: 78, unidades_por_paquete: 500, costo_paquete: 41217 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Ahuesado 78g', formato: '72x102', tipo_papel: null, gramaje: 78, unidades_por_paquete: 250, costo_paquete: 23886 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Ahuesado 78g', formato: '72x102', tipo_papel: null, gramaje: 78, unidades_por_paquete: 500, costo_paquete: 47773 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Ahuesado 78g', formato: '77x110', tipo_papel: null, gramaje: 78, unidades_por_paquete: 250, costo_paquete: 27552 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Ahuesado 78g', formato: '77x110', tipo_papel: null, gramaje: 78, unidades_por_paquete: 500, costo_paquete: 55104 },

      // ══════════════════════════════════════════════════════════
      // PAPEL INTERIOR — Base Negra (Lista 10-03)
      // ══════════════════════════════════════════════════════════
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Base Negra 110g', formato: '77x110', tipo_papel: null, gramaje: 110, unidades_por_paquete: 250, costo_paquete: 54784 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Base Negra 180g', formato: '77x110', tipo_papel: null, gramaje: 180, unidades_por_paquete: 125, costo_paquete: 41286 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Base Negra 350g', formato: '77x110', tipo_papel: null, gramaje: 350, unidades_por_paquete: 100, costo_paquete: 62457 },

      // ══════════════════════════════════════════════════════════
      // PAPEL TAPA — Cartulinas Sólidas Blancas (Lista 10-04)
      // ══════════════════════════════════════════════════════════
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Cartulina Sólida 180g', formato: '77x110', tipo_papel: null, gramaje: 180, unidades_por_paquete: 125, costo_paquete: 30639 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Cartulina Sólida 180g', formato: '77x110', tipo_papel: null, gramaje: 180, unidades_por_paquete: 150, costo_paquete: 38743 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Cartulina Sólida 240g', formato: '77x110', tipo_papel: null, gramaje: 240, unidades_por_paquete: 100, costo_paquete: 33863 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Cartulina Sólida 240g', formato: '77x110', tipo_papel: null, gramaje: 240, unidades_por_paquete: 125, costo_paquete: 42329 },

      // ══════════════════════════════════════════════════════════
      // PAPEL TAPA — Cartulinas Sólidas de Color (Lista 10-05)
      // Precio: 2% Adicional efectivo/transferencia (neto sin IVA)
      // ══════════════════════════════════════════════════════════
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Cartulina Sólida Celeste 240g', formato: '77x110', tipo_papel: null, gramaje: 240, unidades_por_paquete: 100, costo_paquete: 34565 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Cartulina Sólida Rosada 240g',  formato: '77x110', tipo_papel: null, gramaje: 240, unidades_por_paquete: 100, costo_paquete: 34565 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Cartulina Sólida Verde 240g',   formato: '77x110', tipo_papel: null, gramaje: 240, unidades_por_paquete: 100, costo_paquete: 34565 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Cartulina Sólida Crema 240g',   formato: '77x110', tipo_papel: null, gramaje: 240, unidades_por_paquete: 100, costo_paquete: 34565 },

      // ══════════════════════════════════════════════════════════
      // PAPEL TAPA — Opalinas (Lista 10-05)
      // Precio: 2% Adicional efectivo/transferencia (neto sin IVA)
      // ══════════════════════════════════════════════════════════

      // Opalina Lisa Blanca
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Opalina Lisa Blanca 200g', formato: '77x110', tipo_papel: null, gramaje: 200, unidades_por_paquete: 100, costo_paquete: 53321 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Opalina Lisa Blanca 225g', formato: '77x110', tipo_papel: null, gramaje: 225, unidades_por_paquete: 100, costo_paquete: 59026 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Opalina Lisa Blanca 250g', formato: '77x110', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 66660 },
      // Opalina Lisa Crema
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Opalina Lisa Crema 200g',  formato: '77x110', tipo_papel: null, gramaje: 200, unidades_por_paquete: 100, costo_paquete: 41144 },
      // Opalina Tela Blanca
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Opalina Tela Blanca 200g', formato: '77x110', tipo_papel: null, gramaje: 200, unidades_por_paquete: 100, costo_paquete: 56651 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Opalina Tela Blanca 225g', formato: '77x110', tipo_papel: null, gramaje: 225, unidades_por_paquete: 100, costo_paquete: 62928 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Opalina Tela Blanca 250g', formato: '77x110', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 70498 },

      // ══════════════════════════════════════════════════════════
      // CARTÓN DÚPLEX — C1S Estucado Reverso Blanco (Lista 10-06)
      // Precio: 2% Dcto efectivo/transferencia (neto sin IVA)
      // ══════════════════════════════════════════════════════════

      // -- Dúplex C1S 72x102 --
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex C1S 190g', formato: '72x102', tipo_papel: null, gramaje: 190, unidades_por_paquete: 100, costo_paquete: 22404 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex C1S 210g', formato: '72x102', tipo_papel: null, gramaje: 210, unidades_por_paquete: 100, costo_paquete: 24136 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex C1S 250g', formato: '72x102', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 27984 },
      // -- Dúplex C1S 77x110 --
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex C1S 190g', formato: '77x110', tipo_papel: null, gramaje: 190, unidades_por_paquete: 100, costo_paquete: 25837 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex C1S 210g', formato: '77x110', tipo_papel: null, gramaje: 210, unidades_por_paquete: 100, costo_paquete: 27850 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex C1S 230g', formato: '77x110', tipo_papel: null, gramaje: 230, unidades_por_paquete: 100, costo_paquete: 29699 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex C1S 250g', formato: '77x110', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 32284 },

      // -- Dúplex GC1 72x102 --
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 190g', formato: '72x102', tipo_papel: null, gramaje: 190, unidades_por_paquete: 100, costo_paquete: 21864 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 210g', formato: '72x102', tipo_papel: null, gramaje: 210, unidades_por_paquete: 100, costo_paquete: 23554 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 215g', formato: '72x102', tipo_papel: null, gramaje: 215, unidades_por_paquete: 100, costo_paquete: 24683 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 235g', formato: '72x102', tipo_papel: null, gramaje: 235, unidades_por_paquete: 100, costo_paquete: 26977 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 270g', formato: '72x102', tipo_papel: null, gramaje: 270, unidades_por_paquete: 100, costo_paquete: 30998 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 295g', formato: '72x102', tipo_papel: null, gramaje: 295, unidades_por_paquete: 100, costo_paquete: 33865 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 325g', formato: '72x102', tipo_papel: null, gramaje: 325, unidades_por_paquete: 100, costo_paquete: 37324 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 350g', formato: '72x102', tipo_papel: null, gramaje: 350, unidades_por_paquete: 100, costo_paquete: 40192 },
      // -- Dúplex GC1 77x110 --
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 190g', formato: '77x110', tipo_papel: null, gramaje: 190, unidades_por_paquete: 100, costo_paquete: 25215 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 215g', formato: '77x110', tipo_papel: null, gramaje: 215, unidades_por_paquete: 100, costo_paquete: 28455 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 235g', formato: '77x110', tipo_papel: null, gramaje: 235, unidades_por_paquete: 100, costo_paquete: 31112 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 250g', formato: '77x110', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 33091 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 270g', formato: '77x110', tipo_papel: null, gramaje: 270, unidades_por_paquete: 100, costo_paquete: 35747 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 295g', formato: '77x110', tipo_papel: null, gramaje: 295, unidades_por_paquete: 100, costo_paquete: 39062 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 325g', formato: '77x110', tipo_papel: null, gramaje: 325, unidades_por_paquete: 100, costo_paquete: 43038 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 350g', formato: '77x110', tipo_papel: null, gramaje: 350, unidades_por_paquete: 100, costo_paquete: 46338 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Dúplex GC1 380g', formato: '77x110', tipo_papel: null, gramaje: 380, unidades_por_paquete: 100, costo_paquete: 50313 },

      // ══════════════════════════════════════════════════════════
      // PAPEL INTERIOR — Multipropósito/Fotocopia (Lista 10-07)
      // Precio: mas de 201 paquetes (precio mas bajo)
      // ══════════════════════════════════════════════════════════
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Multipropósito Carta 75g', formato: 'Carta', tipo_papel: null, gramaje: 75, unidades_por_paquete: 500, costo_paquete: 3193 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Multipropósito Oficio 75g',formato: 'Oficio', tipo_papel: null, gramaje: 75, unidades_por_paquete: 500, costo_paquete: 3892 },

      // ══════════════════════════════════════════════════════════
      // PAPEL ESPECIAL — Seda y Mantequilla (Lista 10-07)
      // ══════════════════════════════════════════════════════════
      { tipo_insumo: 'Papel Especial', nombre_insumo: 'Papel Mantequilla 40g', formato: '80x100', tipo_papel: null, gramaje: 40, unidades_por_paquete: 250,  costo_paquete: 20291 },
      { tipo_insumo: 'Papel Especial', nombre_insumo: 'Papel Seda Blanco 20g', formato: '80x100', tipo_papel: null, gramaje: 20, unidades_por_paquete: 1000, costo_paquete: 42960 },

      // ══════════════════════════════════════════════════════════
      // PAPEL KRAFT (Lista 10-07)
      // Precio: 2% Dcto efectivo/transferencia (neto sin IVA)
      // Selección de gramajes y formatos más usados en imprenta
      // ══════════════════════════════════════════════════════════

      // -- 60g --
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 60g', formato: '77x110',  tipo_papel: null, gramaje: 60, unidades_por_paquete: 250, costo_paquete: 21362 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 60g', formato: '77x110',  tipo_papel: null, gramaje: 60, unidades_por_paquete: 500, costo_paquete: 42723 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 60g', formato: '80x110',  tipo_papel: null, gramaje: 60, unidades_por_paquete: 250, costo_paquete: 21940 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 60g', formato: '80x110',  tipo_papel: null, gramaje: 60, unidades_por_paquete: 500, costo_paquete: 43880 },
      // -- 70g --
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 70g', formato: '77x110',  tipo_papel: null, gramaje: 70, unidades_por_paquete: 250, costo_paquete: 25498 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 70g', formato: '77x110',  tipo_papel: null, gramaje: 70, unidades_por_paquete: 500, costo_paquete: 50995 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 70g', formato: '80x110',  tipo_papel: null, gramaje: 70, unidades_por_paquete: 250, costo_paquete: 26498 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 70g', formato: '80x110',  tipo_papel: null, gramaje: 70, unidades_por_paquete: 500, costo_paquete: 52995 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 70g', formato: '115x144', tipo_papel: null, gramaje: 70, unidades_por_paquete: 125, costo_paquete: 24242 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 70g', formato: '115x154', tipo_papel: null, gramaje: 70, unidades_por_paquete: 125, costo_paquete: 25928 },
      // -- 100g --
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 100g', formato: '77x110', tipo_papel: null, gramaje: 100, unidades_por_paquete: 250, costo_paquete: 38427 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 100g', formato: '80x110', tipo_papel: null, gramaje: 100, unidades_por_paquete: 250, costo_paquete: 39938 },
      // -- 114g --
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 114g', formato: '77x110', tipo_papel: null, gramaje: 114, unidades_por_paquete: 250, costo_paquete: 43186 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 114g', formato: '80x110', tipo_papel: null, gramaje: 114, unidades_por_paquete: 250, costo_paquete: 44868 },
      // -- 125g --
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 125g', formato: '77x110', tipo_papel: null, gramaje: 125, unidades_por_paquete: 250, costo_paquete: 42472 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 125g', formato: '80x110', tipo_papel: null, gramaje: 125, unidades_por_paquete: 250, costo_paquete: 44124 },
      // -- 171g --
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 171g', formato: '80x110',   tipo_papel: null, gramaje: 171, unidades_por_paquete: 125, costo_paquete: 30172 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 171g', formato: '76.5x110', tipo_papel: null, gramaje: 171, unidades_por_paquete: 125, costo_paquete: 28856 },
      // -- 200g --
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 200g', formato: '110x77', tipo_papel: null, gramaje: 200, unidades_por_paquete: 125, costo_paquete: 33976 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 200g', formato: '110x80', tipo_papel: null, gramaje: 200, unidades_por_paquete: 125, costo_paquete: 35299 },
      // -- 250g --
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 250g', formato: '110x80', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 35299 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 250g', formato: '110x80', tipo_papel: null, gramaje: 250, unidades_por_paquete: 125, costo_paquete: 44124 },
      // -- 300g --
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 300g', formato: '110x77', tipo_papel: null, gramaje: 300, unidades_por_paquete: 100, costo_paquete: 40771 },
      { tipo_insumo: 'Papel Kraft', nombre_insumo: 'Kraft 300g', formato: '80x110', tipo_papel: null, gramaje: 300, unidades_por_paquete: 100, costo_paquete: 42359 },

      // ══════════════════════════════════════════════════════════
      // PAPEL COUCHÉ BRILLANTE (Lista 10-10)
      // Precio: 2% Dcto SOLO Efectivo o Transferencia (neto sin IVA)
      // ══════════════════════════════════════════════════════════

      // -- Brillante 77x110 --
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 100g', formato: '77x110', tipo_papel: null, gramaje: 100, unidades_por_paquete: 250, costo_paquete: 33785 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 130g', formato: '77x110', tipo_papel: null, gramaje: 130, unidades_por_paquete: 125, costo_paquete: 21834 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 130g', formato: '77x110', tipo_papel: null, gramaje: 130, unidades_por_paquete: 200, costo_paquete: 34900 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 130g', formato: '77x110', tipo_papel: null, gramaje: 130, unidades_por_paquete: 250, costo_paquete: 43668 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 170g', formato: '77x110', tipo_papel: null, gramaje: 170, unidades_por_paquete: 125, costo_paquete: 28552 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 170g', formato: '77x110', tipo_papel: null, gramaje: 170, unidades_por_paquete: 250, costo_paquete: 57103 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 200g', formato: '77x110', tipo_papel: null, gramaje: 200, unidades_por_paquete: 100, costo_paquete: 26869 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 200g', formato: '77x110', tipo_papel: null, gramaje: 200, unidades_por_paquete: 125, costo_paquete: 33587 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 200g', formato: '77x110', tipo_papel: null, gramaje: 200, unidades_por_paquete: 250, costo_paquete: 67173 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 250g', formato: '77x110', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 34241 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 250g', formato: '77x110', tipo_papel: null, gramaje: 250, unidades_por_paquete: 125, costo_paquete: 42804 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 300g', formato: '77x110', tipo_papel: null, gramaje: 300, unidades_por_paquete: 50,  costo_paquete: 20544 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 300g', formato: '77x110', tipo_papel: null, gramaje: 300, unidades_por_paquete: 100, costo_paquete: 41088 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 300g', formato: '77x110', tipo_papel: null, gramaje: 300, unidades_por_paquete: 125, costo_paquete: 51361 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 350g', formato: '77x110', tipo_papel: null, gramaje: 350, unidades_por_paquete: 50,  costo_paquete: 23972 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 350g', formato: '77x110', tipo_papel: null, gramaje: 350, unidades_por_paquete: 100, costo_paquete: 47943 },

      // -- Brillante 72x102 --
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 100g', formato: '72x102', tipo_papel: null, gramaje: 100, unidades_por_paquete: 250, costo_paquete: 29125 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 130g', formato: '72x102', tipo_papel: null, gramaje: 130, unidades_por_paquete: 125, costo_paquete: 18932 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 130g', formato: '72x102', tipo_papel: null, gramaje: 130, unidades_por_paquete: 250, costo_paquete: 37864 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 170g', formato: '72x102', tipo_papel: null, gramaje: 170, unidades_por_paquete: 125, costo_paquete: 24762 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 170g', formato: '72x102', tipo_papel: null, gramaje: 170, unidades_por_paquete: 150, costo_paquete: 29715 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 170g', formato: '72x102', tipo_papel: null, gramaje: 170, unidades_por_paquete: 250, costo_paquete: 49524 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 200g', formato: '72x102', tipo_papel: null, gramaje: 200, unidades_por_paquete: 100, costo_paquete: 23350 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 200g', formato: '72x102', tipo_papel: null, gramaje: 200, unidades_por_paquete: 125, costo_paquete: 29186 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 200g', formato: '72x102', tipo_papel: null, gramaje: 200, unidades_por_paquete: 250, costo_paquete: 58373 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 250g', formato: '72x102', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 29690 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 250g', formato: '72x102', tipo_papel: null, gramaje: 250, unidades_por_paquete: 125, costo_paquete: 37112 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 300g', formato: '72x102', tipo_papel: null, gramaje: 300, unidades_por_paquete: 100, costo_paquete: 35628 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 300g', formato: '72x102', tipo_papel: null, gramaje: 300, unidades_por_paquete: 125, costo_paquete: 44535 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 350g', formato: '72x102', tipo_papel: null, gramaje: 350, unidades_por_paquete: 50,  costo_paquete: 20787 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 350g', formato: '72x102', tipo_papel: null, gramaje: 350, unidades_por_paquete: 100, costo_paquete: 41574 },

      // -- Brillante 62x92 --
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 100g', formato: '62x92', tipo_papel: null, gramaje: 100, unidades_por_paquete: 250, costo_paquete: 22621 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 130g', formato: '62x92', tipo_papel: null, gramaje: 130, unidades_por_paquete: 250, costo_paquete: 29407 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 170g', formato: '62x92', tipo_papel: null, gramaje: 170, unidades_por_paquete: 250, costo_paquete: 38468 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 200g', formato: '62x92', tipo_papel: null, gramaje: 200, unidades_por_paquete: 100, costo_paquete: 18097 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 200g', formato: '62x92', tipo_papel: null, gramaje: 200, unidades_por_paquete: 125, costo_paquete: 22621 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 200g', formato: '62x92', tipo_papel: null, gramaje: 200, unidades_por_paquete: 250, costo_paquete: 45240 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 250g', formato: '62x92', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 23058 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 250g', formato: '62x92', tipo_papel: null, gramaje: 250, unidades_por_paquete: 125, costo_paquete: 28825 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 250g', formato: '62x92', tipo_papel: null, gramaje: 250, unidades_por_paquete: 250, costo_paquete: 57646 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 300g', formato: '62x92', tipo_papel: null, gramaje: 300, unidades_por_paquete: 100, costo_paquete: 27672 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 300g', formato: '62x92', tipo_papel: null, gramaje: 300, unidades_por_paquete: 125, costo_paquete: 34589 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 350g', formato: '62x92', tipo_papel: null, gramaje: 350, unidades_por_paquete: 100, costo_paquete: 32284 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Brillante 350g', formato: '62x92', tipo_papel: null, gramaje: 350, unidades_por_paquete: 125, costo_paquete: 40352 },

      // ══════════════════════════════════════════════════════════
      // PAPEL COUCHÉ OPACO (Lista 10-11)
      // Precio: 2% Dcto SOLO Efectivo o Transferencia (neto sin IVA)
      // ══════════════════════════════════════════════════════════

      // -- Opaco 77x110 --
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 100g', formato: '77x110', tipo_papel: null, gramaje: 100, unidades_por_paquete: 250, costo_paquete: 33596 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 130g', formato: '77x110', tipo_papel: null, gramaje: 130, unidades_por_paquete: 125, costo_paquete: 21835 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 130g', formato: '77x110', tipo_papel: null, gramaje: 130, unidades_por_paquete: 200, costo_paquete: 34935 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 130g', formato: '77x110', tipo_papel: null, gramaje: 130, unidades_por_paquete: 250, costo_paquete: 43668 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 170g', formato: '77x110', tipo_papel: null, gramaje: 170, unidades_por_paquete: 125, costo_paquete: 28552 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 170g', formato: '77x110', tipo_papel: null, gramaje: 170, unidades_por_paquete: 250, costo_paquete: 57103 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 200g', formato: '77x110', tipo_papel: null, gramaje: 200, unidades_por_paquete: 100, costo_paquete: 26869 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 200g', formato: '77x110', tipo_papel: null, gramaje: 200, unidades_por_paquete: 125, costo_paquete: 33587 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 200g', formato: '77x110', tipo_papel: null, gramaje: 200, unidades_por_paquete: 250, costo_paquete: 67173 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 250g', formato: '77x110', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 34241 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 250g', formato: '77x110', tipo_papel: null, gramaje: 250, unidades_por_paquete: 125, costo_paquete: 42804 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 300g', formato: '77x110', tipo_papel: null, gramaje: 300, unidades_por_paquete: 50,  costo_paquete: 20544 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 300g', formato: '77x110', tipo_papel: null, gramaje: 300, unidades_por_paquete: 100, costo_paquete: 41088 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 300g', formato: '77x110', tipo_papel: null, gramaje: 300, unidades_por_paquete: 125, costo_paquete: 51362 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 350g', formato: '77x110', tipo_papel: null, gramaje: 350, unidades_por_paquete: 50,  costo_paquete: 23972 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 350g', formato: '77x110', tipo_papel: null, gramaje: 350, unidades_por_paquete: 100, costo_paquete: 47943 },

      // -- Opaco 72x102 --
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 100g', formato: '72x102', tipo_papel: null, gramaje: 100, unidades_por_paquete: 250, costo_paquete: 29125 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 130g', formato: '72x102', tipo_papel: null, gramaje: 130, unidades_por_paquete: 250, costo_paquete: 37864 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 170g', formato: '72x102', tipo_papel: null, gramaje: 170, unidades_por_paquete: 125, costo_paquete: 24762 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 170g', formato: '72x102', tipo_papel: null, gramaje: 170, unidades_por_paquete: 250, costo_paquete: 49524 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 200g', formato: '72x102', tipo_papel: null, gramaje: 200, unidades_por_paquete: 125, costo_paquete: 29186 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 200g', formato: '72x102', tipo_papel: null, gramaje: 200, unidades_por_paquete: 250, costo_paquete: 58373 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 250g', formato: '72x102', tipo_papel: null, gramaje: 250, unidades_por_paquete: 125, costo_paquete: 37114 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 300g', formato: '72x102', tipo_papel: null, gramaje: 300, unidades_por_paquete: 100, costo_paquete: 35628 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 300g', formato: '72x102', tipo_papel: null, gramaje: 300, unidades_por_paquete: 125, costo_paquete: 44535 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 350g', formato: '72x102', tipo_papel: null, gramaje: 350, unidades_por_paquete: 50,  costo_paquete: 20787 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 350g', formato: '72x102', tipo_papel: null, gramaje: 350, unidades_por_paquete: 100, costo_paquete: 41574 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 350g', formato: '72x102', tipo_papel: null, gramaje: 350, unidades_por_paquete: 125, costo_paquete: 51968 },

      // -- Opaco 62x92 --
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 100g', formato: '62x92', tipo_papel: null, gramaje: 100, unidades_por_paquete: 250, costo_paquete: 22621 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 100g', formato: '62x92', tipo_papel: null, gramaje: 100, unidades_por_paquete: 500, costo_paquete: 45240 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 130g', formato: '62x92', tipo_papel: null, gramaje: 130, unidades_por_paquete: 250, costo_paquete: 29407 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 170g', formato: '62x92', tipo_papel: null, gramaje: 170, unidades_por_paquete: 250, costo_paquete: 38468 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 200g', formato: '62x92', tipo_papel: null, gramaje: 200, unidades_por_paquete: 125, costo_paquete: 22621 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 200g', formato: '62x92', tipo_papel: null, gramaje: 200, unidades_por_paquete: 250, costo_paquete: 45240 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 250g', formato: '62x92', tipo_papel: null, gramaje: 250, unidades_por_paquete: 100, costo_paquete: 23085 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 250g', formato: '62x92', tipo_papel: null, gramaje: 250, unidades_por_paquete: 125, costo_paquete: 28831 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 300g', formato: '62x92', tipo_papel: null, gramaje: 300, unidades_por_paquete: 100, costo_paquete: 27671 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 300g', formato: '62x92', tipo_papel: null, gramaje: 300, unidades_por_paquete: 125, costo_paquete: 34589 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 350g', formato: '62x92', tipo_papel: null, gramaje: 350, unidades_por_paquete: 100, costo_paquete: 32284 },
      { tipo_insumo: 'Papel Couché', nombre_insumo: 'Couché Opaco 350g', formato: '62x92', tipo_papel: null, gramaje: 350, unidades_por_paquete: 125, costo_paquete: 40353 },

      // ══════════════════════════════════════════════════════════
      // CARTÓN PIEDRA (Lista 10-14 A)
      // Precio: mas de 200 pliegos (neto sin IVA)
      // unidades_por_paquete: 1 → precio es por pliego
      // ══════════════════════════════════════════════════════════

      // -- Cartón Piedra Gris y Negro 77x110 --
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 1.25mm', formato: '77x110', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 788 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 1.5mm',  formato: '77x110', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 984 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 1.75mm', formato: '77x110', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 1150 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 2.0mm',  formato: '77x110', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 1311 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 2.5mm',  formato: '77x110', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 1667 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 3.0mm',  formato: '77x110', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 1798 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra Base Negra 1.68mm', formato: '77x110', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 1866 },

      // -- Cartón Piedra Gris 85x115 --
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 1.25mm', formato: '85x115', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 867 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 1.5mm',  formato: '85x115', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 1090 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 1.75mm', formato: '85x115', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 1326 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 2.0mm',  formato: '85x115', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 1454 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 2.5mm',  formato: '85x115', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 1872 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra 3.0mm',  formato: '85x115', tipo_papel: null, gramaje: null, unidades_por_paquete: 1, costo_paquete: 2055 },

      // ══════════════════════════════════════════════════════════
      // MATERIAL ESPECIAL — Imantado Base Café (Lista 10-14 B)
      // Precio: Contado 2% (valores más IVA — neto sin IVA)
      // unidades_por_paquete: metros por rollo
      // ══════════════════════════════════════════════════════════
      { tipo_insumo: 'Material Especial', nombre_insumo: 'Imantado Base Café 0.30mm', formato: '61cm ancho', tipo_papel: null, gramaje: null, unidades_por_paquete: 40, costo_paquete: 74288 },
      { tipo_insumo: 'Material Especial', nombre_insumo: 'Imantado Base Café 0.35mm', formato: '61cm ancho', tipo_papel: null, gramaje: null, unidades_por_paquete: 30, costo_paquete: 60002 },
      { tipo_insumo: 'Material Especial', nombre_insumo: 'Imantado Base Café 0.40mm', formato: '61cm ancho', tipo_papel: null, gramaje: null, unidades_por_paquete: 30, costo_paquete: 63773 },
      { tipo_insumo: 'Material Especial', nombre_insumo: 'Imantado Base Café 0.70mm', formato: '61cm ancho', tipo_papel: null, gramaje: null, unidades_por_paquete: 30, costo_paquete: 103432 },

      // ══════════════════════════════════════════════════════════
      // CARTÓN PIEDRA DIMENSIONADO (Lista 10-14 C)
      // Precio Distribuidor (neto sin IVA)
      // unidades_por_paquete: 25 (mínimo de venta)
      // costo_paquete: precio_unitario × 25
      // ══════════════════════════════════════════════════════════

      // -- Tamaño 2 (55x77 cm) --
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra Gris 1.5mm',      formato: '55x77', tipo_papel: null, gramaje: null, unidades_por_paquete: 25, costo_paquete: 12950 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra Gris 2.0mm',      formato: '55x77', tipo_papel: null, gramaje: null, unidades_por_paquete: 25, costo_paquete: 17250 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra Base Negra 1.68mm',formato: '55x77', tipo_papel: null, gramaje: null, unidades_por_paquete: 25, costo_paquete: 24250 },

      // -- Tamaño 4 (38.5x55 cm) --
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra Gris 1.5mm',      formato: '38.5x55', tipo_papel: null, gramaje: null, unidades_por_paquete: 25, costo_paquete: 6475 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra Gris 2.0mm',      formato: '38.5x55', tipo_papel: null, gramaje: null, unidades_por_paquete: 25, costo_paquete: 8650 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra Base Negra 1.68mm',formato: '38.5x55', tipo_papel: null, gramaje: null, unidades_por_paquete: 25, costo_paquete: 12125 },

      // -- Tamaño 8 (27.5x38.5 cm) --
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra Gris 1.5mm',      formato: '27.5x38.5', tipo_papel: null, gramaje: null, unidades_por_paquete: 25, costo_paquete: 3250 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra Gris 2.0mm',      formato: '27.5x38.5', tipo_papel: null, gramaje: null, unidades_por_paquete: 25, costo_paquete: 4325 },
      { tipo_insumo: 'Cartón Piedra', nombre_insumo: 'Cartón Piedra Base Negra 1.68mm',formato: '27.5x38.5', tipo_papel: null, gramaje: null, unidades_por_paquete: 25, costo_paquete: 6075 },

      // ══════════════════════════════════════════════════════════
      // SOBRES (Lista 10-15)
      // Precio por caja (neto sin IVA)
      // unidades_por_paquete: unidades por caja
      // ══════════════════════════════════════════════════════════
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Carta Chico 9.3x14',         formato: '9.3x14',   tipo_papel: 'B-80', gramaje: 80,  unidades_por_paquete: 1000, costo_paquete: 23953 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Carta Blanco 12.4x15.4',     formato: '12.4x15.4',tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 1000, costo_paquete: 25614 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Carta Blanco 12.4x15.4',     formato: '12.4x15.4',tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 1000, costo_paquete: 27774 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/4 Oficio 13x19',           formato: '13x19',    tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500,  costo_paquete: 16960 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/4 Oficio 13x19',           formato: '13x19',    tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 1000, costo_paquete: 33922 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/4 Oficio 13x19',           formato: '13x19',    tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 1000, costo_paquete: 40595 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/3 Oficio 13x24',           formato: '13x24',    tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500,  costo_paquete: 25877 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/3 Oficio 13x24',           formato: '13x24',    tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500,  costo_paquete: 26999 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Cartera Publicitario 15.5x23',formato: '15.5x23', tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500,  costo_paquete: 25462 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Cartera Publicitario 15.5x23',formato: '15.5x23', tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500,  costo_paquete: 28231 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/2 Carta 15x23',            formato: '15x23',    tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500,  costo_paquete: 23814 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/2 Oficio 20x26',           formato: '20x26',    tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500,  costo_paquete: 36345 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/2 Oficio 20x26',           formato: '20x26',    tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500,  costo_paquete: 40148 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/2 Oficio 20x26',           formato: '20x26',    tipo_papel: 'Kraft',gramaje: 70,  unidades_por_paquete: 500,  costo_paquete: 38127 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/1 Oficio 24x34',           formato: '24x34',    tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500,  costo_paquete: 50896 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/1 Oficio 24x34',           formato: '24x34',    tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500,  costo_paquete: 55991 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/1 Oficio 24x34',           formato: '24x34',    tipo_papel: 'Kraft',gramaje: 70,  unidades_por_paquete: 500,  costo_paquete: 55911 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre 1/1 Oficio 24x34 Hilado',    formato: '24x34',    tipo_papel: 'Hilado',gramaje: 106, unidades_por_paquete: 500,  costo_paquete: 66377 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Tarjeta Visita 7x10.5',      formato: '7x10.5',   tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 1000, costo_paquete: 22541 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Americano 10x23',            formato: '10x23',    tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500,  costo_paquete: 13389 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Americano 10x23',            formato: '10x23',    tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500,  costo_paquete: 17224 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Americano 10x23 Hilado',     formato: '10x23',    tipo_papel: 'Hilado',gramaje: 106, unidades_por_paquete: 900,  costo_paquete: 36411 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Americano 10x23 Kraft',      formato: '10x23',    tipo_papel: 'Kraft', gramaje: 70, unidades_por_paquete: 1000, costo_paquete: 35275 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Americano Con Ventana 10x23',formato: '10x23',    tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500,  costo_paquete: 19578 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Amer. Superior 10.5x24',     formato: '10.5x24',  tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500,  costo_paquete: 21114 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Amer. Superior 10.5x24',     formato: '10.5x24',  tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500,  costo_paquete: 20228 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Amer. Cartera 10x23',        formato: '10x23',    tipo_papel: 'B-80', gramaje: 80,  unidades_por_paquete: 1000, costo_paquete: 28656 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Amer. Cartera 10x23',        formato: '10x23',    tipo_papel: 'B-90', gramaje: 90,  unidades_por_paquete: 500,  costo_paquete: 18017 },
      { tipo_insumo: 'Sobre', nombre_insumo: 'Sobre Amer. Cartera 10x23',        formato: '10x23',    tipo_papel: 'B-90', gramaje: 90,  unidades_por_paquete: 1000, costo_paquete: 36030 },

      // ══════════════════════════════════════════════════════════
      // SACOS (Lista 10-15)
      // ══════════════════════════════════════════════════════════
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco 1/2 Oficio 20x28',            formato: '20x28', tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500, costo_paquete: 40415 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco 1/2 Oficio 20x28',            formato: '20x28', tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500, costo_paquete: 45192 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco 1/2 Oficio 20x28 Kraft',      formato: '20x28', tipo_papel: 'Kraft',gramaje: 70,  unidades_por_paquete: 500, costo_paquete: 41763 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco Revista 23x30',               formato: '23x30', tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500, costo_paquete: 49359 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco Revista 23x30',               formato: '23x30', tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500, costo_paquete: 42686 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco Revista 23x30 Kraft',         formato: '23x30', tipo_papel: 'Kraft',gramaje: 70,  unidades_por_paquete: 500, costo_paquete: 48999 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco Revista Con Dry Letter 23x30', formato: '23x30',tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500, costo_paquete: 61008 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco 1/1 Oficio 25x36',            formato: '25x36', tipo_papel: 'B-80', gramaje: 80,  unidades_por_paquete: 500, costo_paquete: 51685 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco 1/1 Oficio 25x36',            formato: '25x36', tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500, costo_paquete: 58685 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco 1/1 Oficio 25x36 Hilado',     formato: '25x36', tipo_papel: 'H-106',gramaje: 106, unidades_por_paquete: 400, costo_paquete: 48127 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco 1/1 Oficio 25x36 Kraft',      formato: '25x36', tipo_papel: 'Kraft',gramaje: 70,  unidades_por_paquete: 500, costo_paquete: 51379 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco 1/1 Oficio 25x36 Kraft 90',   formato: '25x36', tipo_papel: 'Kraft',gramaje: 90,  unidades_por_paquete: 400, costo_paquete: 67094 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco 1/1 Oficio Con Dry Letter 25x36',formato:'25x36',tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 250, costo_paquete: 38705 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco 1/1 Oficio Con Dry Letter 25x36 Hilado',formato:'25x36',tipo_papel:'Hilado',gramaje:106,unidades_por_paquete:400,costo_paquete:68618 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco Universal 30x40',             formato: '30x40', tipo_papel: 'B-24', gramaje: 80,  unidades_por_paquete: 500, costo_paquete: 61696 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco Universal 30x40',             formato: '30x40', tipo_papel: 'B-29', gramaje: 90,  unidades_por_paquete: 500, costo_paquete: 65240 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco Universal 30x40 Kraft',       formato: '30x40', tipo_papel: 'Kraft',gramaje: 70,  unidades_por_paquete: 500, costo_paquete: 69734 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco Universal 30x40 Hilado',      formato: '30x40', tipo_papel: 'Hilado',gramaje:106, unidades_por_paquete: 400, costo_paquete: 74024 },
      { tipo_insumo: 'Saco', nombre_insumo: 'Saco Universal 30x40 Kraft 90',    formato: '30x40', tipo_papel: 'Kraft', gramaje: 90, unidades_por_paquete: 400, costo_paquete: 88800 },

      // ══════════════════════════════════════════════════════════
      // PAPEL AUTOADHESIVO — Arco Sheets / Fedrigoni (Lista 10-27)
      // Precio: Pago Contado 3% adicional (neto sin IVA)
      // unidades_por_paquete: pliegos por resma
      // costo_paquete: precio/pliego × unidades (resma completa)
      // ══════════════════════════════════════════════════════════
      { tipo_insumo: 'Papel Autoadhesivo', nombre_insumo: 'Autoadhesivo Opaco Con Corte',         formato: '70x100', tipo_papel: null, gramaje: null, unidades_por_paquete: 125, costo_paquete: 50000 },
      { tipo_insumo: 'Papel Autoadhesivo', nombre_insumo: 'Autoadhesivo Opaco Sin Corte',          formato: '70x100', tipo_papel: null, gramaje: null, unidades_por_paquete: 125, costo_paquete: 48625 },
      { tipo_insumo: 'Papel Autoadhesivo', nombre_insumo: 'Autoadhesivo Semi Brillo Con Corte',    formato: '70x100', tipo_papel: null, gramaje: null, unidades_por_paquete: 125, costo_paquete: 50375 },
      { tipo_insumo: 'Papel Autoadhesivo', nombre_insumo: 'Autoadhesivo Semi Brillo Sin Corte',    formato: '70x100', tipo_papel: null, gramaje: null, unidades_por_paquete: 125, costo_paquete: 49000 },
      { tipo_insumo: 'Papel Autoadhesivo', nombre_insumo: 'Autoadhesivo Alto Brillo Con Corte',    formato: '70x100', tipo_papel: null, gramaje: null, unidades_por_paquete: 125, costo_paquete: 54875 },
      { tipo_insumo: 'Papel Autoadhesivo', nombre_insumo: 'Autoadhesivo Alto Brillo Sin Corte',    formato: '70x100', tipo_papel: null, gramaje: null, unidades_por_paquete: 125, costo_paquete: 53500 },
      { tipo_insumo: 'Papel Autoadhesivo', nombre_insumo: 'PVC Blanco Fedrigoni',                  formato: '70x100', tipo_papel: null, gramaje: null, unidades_por_paquete: 100, costo_paquete: 86200 },
      { tipo_insumo: 'Papel Autoadhesivo', nombre_insumo: 'PVC Transparente Fedrigoni',            formato: '70x100', tipo_papel: null, gramaje: null, unidades_por_paquete: 100, costo_paquete: 86200 },
    ];
    for (const s of supplies) await createSupply(s);

    // ── Processes + Pricing ────────────────────────────────────
    // valor_aplicado = costo TOTAL para ese lote (no por unidad)

    const processTiers = {
      // ── TAPA ────────────────────────────────────────────────────
      'Impresión Tapa': [
        [1, 1000], [6, 6000], [10, 10000], [20, 20000], [30, 30000],
        [50, 55000], [100, 110000], [200, 200000], [300, 150000], [550, 385000],
      ],
      'Polilaminado Tapa': [
        [1, 1000], [6, 5000], [10, 10000], [20, 10000], [30, 15000],
        [50, 20000], [100, 20000], [200, 60000], [300, 35000], [550, 60000],
      ],
      'Cartón Piedra': [
        [10, 6000], [50, 15000], [100, 35000], [200, 35000], [300, 26000], [550, 250000],
      ],
      'Corte Tapa': [
        [10, 5000], [50, 5000], [100, 5000], [200, 5000], [300, 5000], [550, 30000],
      ],
      'Mano de Obra': [
        [10, 30000], [50, 100000], [100, 150000], [300, 450000], [550, 330000],
      ],

      // ── PAPEL ESPEJO ─────────────────────────────────────────────
      'Impresión Papel Espejo': [
        [50, 25000], [100, 50000], [200, 45000],
      ],
      'Papel Espejo': [
        [300, 75000], [550, 75000],
      ],
      'Polilaminado Espejo': [
        [50, 25000], [100, 30000], [200, 30000], [300, 30000], [550, 60000],
      ],
      'Corte Espejo': [
        [50, 5000], [100, 5000], [200, 5000], [300, 5000], [550, 30000],
      ],

      // ── INTERCALADO ──────────────────────────────────────────────
      'Impresión Intercalado': [
        [10, 30000], [50, 25000], [100, 50000],
      ],
      'Corte Intercalado': [
        [50, 5000], [100, 5000],
      ],

      // ── INTERIOR ─────────────────────────────────────────────────
      'Impresión Interior': [
        [1, 5700], [6, 34200], [10, 60000], [20, 114000], [30, 171000],
        [100, 100000], [200, 60000], [300, 20000], [550, 380000],
      ],
      'Planchas': [
        [50, 5000], [100, 5000], [200, 10000], [300, 20000],
      ],
      'Corte Interior': [
        [1, 5000], [6, 5000], [10, 5000], [20, 5000], [30, 10000],
        [50, 10000], [100, 7000], [200, 30000], [300, 30000], [550, 30000],
      ],
      'Anillo': [
        [1, 2000], [6, 12000], [10, 20000], [20, 40000], [30, 60000],
        [50, 20000], [100, 25000], [200, 80000], [300, 80000], [550, 80000],
      ],
      'Anillado': [
        [50, 25000], [100, 75000], [200, 75000], [300, 75000], [550, 275000],
      ],

      // ── SERVICIOS ────────────────────────────────────────────────
      'Diseño': [
        [50, 30000], [100, 30000],
      ],
      'Delivery': [
        [1, 3000], [51, 2500], [201, 2000], [501, 1500],
      ],

      // ── TALONARIO ────────────────────────────────────────────────
      'Impresión Talonario 1 Color': [
        [20, 25000], [50, 40000], [100, 70000], [200, 120000], [500, 200000],
      ],
      'Impresión Talonario 2 Colores': [
        [20, 35000], [50, 55000], [100, 95000], [200, 160000], [500, 280000],
      ],
      'Impresión Talonario Full Color': [
        [20, 50000], [50, 80000], [100, 140000], [200, 240000], [500, 400000],
      ],
      'Folio': [
        [1, 10000],
      ],
      'Prepicado': [
        [1, 8000],
      ],
      'Corchete y Cinta': [
        [1, 4000],
      ],
      'Engomado': [
        [1, 3000],
      ],
      'Cartón Base Talonario': [
        [1, 5000],
      ],
      'Alzado Talonario': [
        [1, 5000],
      ],
      'Planchas Talonario': [
        [1, 20000],
      ],
      'Corte Talonario': [
        [1, 30000],
      ],

      // ── FLYER / OTROS ─────────────────────────────────────────────
      'Laminado': [
        [1, 800], [51, 600], [101, 500], [501, 400], [1001, 300],
      ],
      'Encuadernación': [
        [1, 1500], [26, 1200], [51, 1000], [101, 750], [501, 500],
      ],
      'Cosido': [
        [1, 2000], [26, 1800], [51, 1500], [101, 1200], [501, 900],
      ],
      'Pegado': [
        [1, 1200], [26, 1000], [51, 800], [101, 600], [501, 450],
      ],
      'Corte': [
        [1, 500], [51, 400], [101, 300], [501, 200], [1001, 150],
      ],
      'Impresión': [
        [1, 150], [101, 100], [501, 70], [1001, 45],
      ],
    };

    let procCount = 0;
    for (const [nombre, tiers] of Object.entries(processTiers)) {
      console.log(`⏳ Creando proceso ${++procCount}: "${nombre}" (${tiers.length} tiers)...`);
      const proc = await createProcess({ nombre });
      for (const [min, valor] of tiers) {
        await createPricing({
          id_proceso: proc.id,
          cantidad_minima: min,
          cantidad_maxima: 999999,
          valor_aplicado: valor,
        });
      }
      console.log(`  ✅ "${nombre}" OK`);
    }

    console.log('✅ Firestore seeding complete!');
  } catch (err) {
    console.error('❌ SEED ERROR:', err);
    throw err;
  }
}
