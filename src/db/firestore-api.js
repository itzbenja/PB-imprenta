import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';

const COLLECTIONS = {
  machines: 'PB_Maquinas',
  supplies: 'PB_Insumos',
  processes: 'PB_Procesos',
  pricing: 'PB_MatrizPrecios',
};

// ── Generic Helpers ───────────────────────────────────────────

async function getAll(colName) {
  const snapshot = await getDocs(collection(db, colName));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function create(colName, data) {
  const ref = await addDoc(collection(db, colName), data);
  return { id: ref.id, ...data };
}

async function update(colName, id, data) {
  const ref = doc(db, colName, id);
  await updateDoc(ref, data);
}

async function remove(colName, id) {
  const ref = doc(db, colName, id);
  await deleteDoc(ref);
}

// ── Machines ──────────────────────────────────────────────────
export const getMachines = () => getAll(COLLECTIONS.machines);
export const createMachine = (data) => create(COLLECTIONS.machines, {
  nombre: data.nombre,
  papel_ancho: Number(data.papel_ancho),
  papel_largo: Number(data.papel_largo),
  impresion_ancho: Number(data.impresion_ancho),
  impresion_largo: Number(data.impresion_largo),
  plancha_ancho: Number(data.plancha_ancho),
  plancha_largo: Number(data.plancha_largo),
});
export const updateMachine = (id, data) => {
  const fields = {};
  for (const k of ['nombre', 'papel_ancho', 'papel_largo', 'impresion_ancho', 'impresion_largo', 'plancha_ancho', 'plancha_largo']) {
    if (data[k] !== undefined) fields[k] = k === 'nombre' ? data[k] : Number(data[k]);
  }
  return update(COLLECTIONS.machines, id, fields);
};
export const deleteMachine = (id) => remove(COLLECTIONS.machines, id);

// ── Supplies ──────────────────────────────────────────────────
export const getSupplies = () => getAll(COLLECTIONS.supplies);
export const createSupply = (data) => create(COLLECTIONS.supplies, {
  tipo_insumo: data.tipo_insumo,
  nombre_insumo: data.nombre_insumo,
  gramaje: data.gramaje ? Number(data.gramaje) : null,
  unidades_por_paquete: Number(data.unidades_por_paquete),
  costo_paquete: Number(data.costo_paquete),
});
export const updateSupply = (id, data) => {
  const fields = {};
  for (const k of ['tipo_insumo', 'nombre_insumo', 'gramaje', 'unidades_por_paquete', 'costo_paquete']) {
    if (data[k] !== undefined) {
      fields[k] = ['tipo_insumo', 'nombre_insumo'].includes(k) ? data[k] : Number(data[k]);
    }
  }
  return update(COLLECTIONS.supplies, id, fields);
};
export const deleteSupply = (id) => remove(COLLECTIONS.supplies, id);

// ── Processes ─────────────────────────────────────────────────
export const getProcesses = () => getAll(COLLECTIONS.processes);
export const createProcess = (data) => create(COLLECTIONS.processes, { nombre: data.nombre });
export const updateProcess = (id, data) => update(COLLECTIONS.processes, id, { nombre: data.nombre });
export const deleteProcess = (id) => remove(COLLECTIONS.processes, id);

// ── Pricing ───────────────────────────────────────────────────
export async function getPricing() {
  const [items, processes] = await Promise.all([
    getAll(COLLECTIONS.pricing),
    getProcesses()
  ]);
  const procMap = {};
  processes.forEach(p => procMap[p.id] = p.nombre);
  return items.map(i => ({ ...i, proceso: procMap[i.id_proceso] || 'Desconocido' }));
}
export const createPricing = (data) => create(COLLECTIONS.pricing, {
  id_proceso: data.id_proceso,
  cantidad_minima: Number(data.cantidad_minima),
  cantidad_maxima: Number(data.cantidad_maxima),
  valor_aplicado: Number(data.valor_aplicado),
});
export const updatePricing = (id, data) => {
  const fields = {};
  for (const k of ['id_proceso', 'cantidad_minima', 'cantidad_maxima', 'valor_aplicado']) {
    if (data[k] !== undefined) fields[k] = k === 'id_proceso' ? data[k] : Number(data[k]);
  }
  return update(COLLECTIONS.pricing, id, fields);
};
export const deletePricing = (id) => remove(COLLECTIONS.pricing, id);

// ── Cotizaciones ──────────────────────────────────────────────
export async function saveCotizacion(quote, formData) {
  return addDoc(collection(db, 'PB_Cotizaciones'), {
    fecha: serverTimestamp(),
    tipo_producto: quote.productType,
    cantidad: quote.quantity,
    dimensiones: quote.dimensions,
    margen_percent: quote.marginPercent,
    costo_papel: Math.round(quote.costoPapel),
    costo_procesos: Math.round(quote.costoProcesos),
    costo_produccion: Math.round(quote.costoProduccion),
    margen_ganancia: Math.round(quote.margenGanancia),
    iva: Math.round(quote.iva),
    total: Math.round(quote.totalCost),
    costo_unitario: Math.round(quote.costPerUnit),
    maquina_interior: quote.interior?.machine || null,
    papel_interior: formData?.interiorSupplyId || null,
    papel_tapa: formData?.coverSupplyId || null,
    terminacion: formData?.bindingProcessId || null,
  });
}

// ── Fetch All Data for Engine ─────────────────────────────────
export async function getAllData() {
  const [machines, supplies, processes, pricing] = await Promise.all([
    getMachines(), getSupplies(), getProcesses(), getPricing(),
  ]);
  return { machines, supplies, processes, pricing };
}
