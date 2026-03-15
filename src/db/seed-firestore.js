/**
 * seed-firestore.js
 * Inserts default machines, supplies, processes and pricing into Firestore.
 */

import {
  createMachine,
  createSupply,
  createProcess,
  createPricing
} from './firestore-api.js';

export default async function seedData() {
  console.log('🌱 Seeding Firestore database...');
  try {
    // ── Machines ────────────────────────────────────────────────
    const machines = [
      { nombre: 'Formato Grande', papel_ancho: 102, papel_largo: 72, impresion_ancho: 101, impresion_largo: 71, plancha_ancho: 102, plancha_largo: 72 },
      { nombre: 'ZOR MZ', papel_ancho: 72, papel_largo: 51, impresion_ancho: 70, impresion_largo: 50, plancha_ancho: 72.5, plancha_largo: 61 },
      { nombre: 'José Utrera', papel_ancho: 64, papel_largo: 46, impresion_ancho: 64, impresion_largo: 45, plancha_ancho: 55, plancha_largo: 65 },
      { nombre: 'GTO 4 Colores', papel_ancho: 52, papel_largo: 36, impresion_ancho: 51, impresion_largo: 34, plancha_ancho: 51, plancha_largo: 40 },
    ];
    for (const m of machines) await createMachine(m);

    // ── Supplies ────────────────────────────────────────────────
    const supplies = [
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco', gramaje: 75, unidades_por_paquete: 500, costo_paquete: 25000 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Bond Blanco', gramaje: 90, unidades_por_paquete: 500, costo_paquete: 32000 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Offset', gramaje: 90, unidades_por_paquete: 500, costo_paquete: 28000 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Couché Brillante', gramaje: 115, unidades_por_paquete: 500, costo_paquete: 45000 },
      { tipo_insumo: 'Papel Interior', nombre_insumo: 'Couché Mate', gramaje: 115, unidades_por_paquete: 500, costo_paquete: 46000 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Cartulina Dúplex', gramaje: 250, unidades_por_paquete: 100, costo_paquete: 55000 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Cartulina Sulfatada', gramaje: 300, unidades_por_paquete: 100, costo_paquete: 68000 },
      { tipo_insumo: 'Papel Tapa', nombre_insumo: 'Couché Brillante', gramaje: 200, unidades_por_paquete: 250, costo_paquete: 52000 },
      { tipo_insumo: 'Cartón Dúplex', nombre_insumo: 'Cartón Dúplex Grueso', gramaje: 400, unidades_por_paquete: 50, costo_paquete: 45000 },
    ];
    for (const s of supplies) await createSupply(s);

    // ── Processes ───────────────────────────────────────────────
    const processNames = ['Impresión', 'Corte', 'Planchas', 'Laminado', 'Encuadernación', 'Engomado', 'Delivery'];
    const processIds = {};
    for (const name of processNames) {
      const p = await createProcess({ nombre: name });
      processIds[name] = p.id;
    }

    // ── Pricing Matrix ──────────────────────────────────────────
    const pricingData = {
      'Impresión': [ [1, 100, 150], [101, 500, 100], [501, 1000, 70], [1001, 5000, 45] ],
      'Corte': [ [1, 50, 500], [51, 100, 400], [101, 500, 300], [501, 1000, 200], [1001, 5000, 150] ],
      'Planchas': [ [1, 1, 28000], [2, 4, 26000], [5, 10, 24000] ],
      'Laminado': [ [1, 50, 800], [51, 100, 600], [101, 500, 500], [501, 1000, 400], [1001, 5000, 300] ],
      'Encuadernación': [ [1, 25, 1500], [26, 50, 1200], [51, 100, 1000], [101, 500, 750], [501, 5000, 500] ],
      'Engomado': [ [1, 50, 300], [51, 100, 250], [101, 500, 200], [501, 1000, 150], [1001, 5000, 100] ],
      'Delivery': [ [1, 50, 3000], [51, 200, 2500], [201, 500, 2000], [501, 5000, 1500] ],
    };

    for (const [procName, ranges] of Object.entries(pricingData)) {
      for (const [min, max, price] of ranges) {
        await createPricing({
          id_proceso: processIds[procName],
          cantidad_minima: min,
          cantidad_maxima: max,
          valor_aplicado: price,
        });
      }
    }

    console.log('✅ Firestore seeding complete!');
    alert('✅ Base de datos Firestore poblada con éxito.');
  } catch (err) {
    console.error('❌ SEED ERROR:', err);
    alert(`Error al guardar en Firebase: ${err.message}. Revisa la consola y asegúrate de que Firestore está creado y las Reglas de Seguridad permiten escritura.`);
    throw err;
  }
}
