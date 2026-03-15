/**
 * seed-firestore.js
 * Datos reales del Excel: LIBRO TAPA DURA CON ANILLADO
 * valor_aplicado = costo TOTAL del lote para ese tier de cantidad
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
      { nombre: 'Formato Grande', papel_ancho: 102, papel_largo: 72, impresion_ancho: 101, impresion_largo: 71, plancha_ancho: 102, plancha_largo: 72 },
      { nombre: 'ZOR MZ',         papel_ancho: 72,  papel_largo: 51, impresion_ancho: 70,  impresion_largo: 50, plancha_ancho: 72.5, plancha_largo: 61 },
      { nombre: 'José Utrera',    papel_ancho: 64,  papel_largo: 46, impresion_ancho: 64,  impresion_largo: 45, plancha_ancho: 55,  plancha_largo: 65 },
      { nombre: 'GTO 4 Colores',  papel_ancho: 52,  papel_largo: 36, impresion_ancho: 51,  impresion_largo: 34, plancha_ancho: 51,  plancha_largo: 40 },
    ];
    for (const m of machines) await createMachine(m);

    // ── Supplies ─────────────────────────────────────────────────
    const supplies = [
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond 75g',           gramaje: 75,  unidades_por_paquete: 500, costo_paquete: 25000 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond 90g',           gramaje: 90,  unidades_por_paquete: 500, costo_paquete: 32000 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Offset 90g',         gramaje: 90,  unidades_por_paquete: 500, costo_paquete: 28000 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Couché Brillante',   gramaje: 115, unidades_por_paquete: 500, costo_paquete: 45000 },
      { tipo_insumo: 'Papel Tapa',     nombre_insumo: 'Cartulina Dúplex',   gramaje: 250, unidades_por_paquete: 100, costo_paquete: 55000 },
      { tipo_insumo: 'Papel Tapa',     nombre_insumo: 'Cartulina Sulfatada',gramaje: 300, unidades_por_paquete: 100, costo_paquete: 68000 },
      { tipo_insumo: 'Papel Tapa',     nombre_insumo: 'Couché Brillante',   gramaje: 200, unidades_por_paquete: 250, costo_paquete: 52000 },
    ];
    for (const s of supplies) await createSupply(s);

    // ── Processes + Pricing (datos reales del Excel) ──────────────
    // Formato: [cantidad_minima, valor_total_lote]
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

      // ── FLYER / OTROS (mantener compatibilidad) ──────────────────
      'Laminado': [
        [1, 800], [51, 600], [101, 500], [501, 400], [1001, 300],
      ],
      'Encuadernación': [
        [1, 1500], [26, 1200], [51, 1000], [101, 750], [501, 500],
      ],
      'Corte': [
        [1, 500], [51, 400], [101, 300], [501, 200], [1001, 150],
      ],
      'Impresión': [
        [1, 150], [101, 100], [501, 70], [1001, 45],
      ],
    };

    for (const [nombre, tiers] of Object.entries(processTiers)) {
      const proc = await createProcess({ nombre });
      for (const [min, valor] of tiers) {
        await createPricing({
          id_proceso: proc.id,
          cantidad_minima: min,
          cantidad_maxima: 999999,
          valor_aplicado: valor,
        });
      }
    }

    console.log('✅ Firestore seeding complete!');
    alert('✅ Base de datos poblada con datos reales del Excel.');
  } catch (err) {
    console.error('❌ SEED ERROR:', err);
    alert(`Error: ${err.message}`);
    throw err;
  }
}
