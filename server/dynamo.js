/**
 * dynamo.js — DynamoDB data access layer.
 * CRUD operations for Machines, Supplies, Processes, Pricing.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, PutCommand, GetCommand,
  ScanCommand, UpdateCommand, DeleteCommand, QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { CreateTableCommand, ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuid } from 'uuid';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'sa-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ddb = DynamoDBDocumentClient.from(client);

const TABLES = {
  machines: 'PB_Maquinas',
  supplies: 'PB_Insumos',
  processes: 'PB_Procesos',
  pricing: 'PB_MatrizPrecios',
};

// ── Table creation ────────────────────────────────────────────

export async function ensureTables() {
  const existing = await client.send(new ListTablesCommand({}));
  const tableNames = existing.TableNames || [];

  for (const table of Object.values(TABLES)) {
    if (!tableNames.includes(table)) {
      console.log(`Creating table: ${table}...`);
      await client.send(new CreateTableCommand({
        TableName: table,
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST',
      }));
      // Wait for table to be active
      let active = false;
      while (!active) {
        const desc = await client.send(new DescribeTableCommand({ TableName: table }));
        active = desc.Table.TableStatus === 'ACTIVE';
        if (!active) await new Promise(r => setTimeout(r, 2000));
      }
      console.log(`Table ${table} ready.`);
    }
  }
}

// ── Generic CRUD ──────────────────────────────────────────────

async function getAll(tableName) {
  const result = await ddb.send(new ScanCommand({ TableName: tableName }));
  return result.Items || [];
}

async function putItem(tableName, item) {
  if (!item.id) item.id = uuid();
  await ddb.send(new PutCommand({ TableName: tableName, Item: item }));
  return item;
}

async function updateItem(tableName, id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;
  const expr = keys.map((k, i) => `#k${i} = :v${i}`).join(', ');
  const names = {};
  const values = {};
  keys.forEach((k, i) => {
    names[`#k${i}`] = k;
    values[`:v${i}`] = fields[k];
  });
  await ddb.send(new UpdateCommand({
    TableName: tableName,
    Key: { id },
    UpdateExpression: `SET ${expr}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  }));
}

async function deleteItem(tableName, id) {
  await ddb.send(new DeleteCommand({ TableName: tableName, Key: { id } }));
}

// ── Machines ──────────────────────────────────────────────────

export async function getMachines() {
  return getAll(TABLES.machines);
}

export async function createMachine(data) {
  return putItem(TABLES.machines, {
    nombre: data.nombre,
    papel_ancho: Number(data.papel_ancho),
    papel_largo: Number(data.papel_largo),
    impresion_ancho: Number(data.impresion_ancho),
    impresion_largo: Number(data.impresion_largo),
    plancha_ancho: Number(data.plancha_ancho),
    plancha_largo: Number(data.plancha_largo),
  });
}

export async function updateMachine(id, data) {
  const fields = {};
  for (const k of ['nombre', 'papel_ancho', 'papel_largo', 'impresion_ancho', 'impresion_largo', 'plancha_ancho', 'plancha_largo']) {
    if (data[k] !== undefined) fields[k] = ['nombre'].includes(k) ? data[k] : Number(data[k]);
  }
  await updateItem(TABLES.machines, id, fields);
}

export async function deleteMachine(id) {
  await deleteItem(TABLES.machines, id);
}

// ── Supplies ──────────────────────────────────────────────────

export async function getSupplies() {
  return getAll(TABLES.supplies);
}

export async function createSupply(data) {
  return putItem(TABLES.supplies, {
    tipo_insumo: data.tipo_insumo,
    nombre_insumo: data.nombre_insumo,
    gramaje: data.gramaje ? Number(data.gramaje) : null,
    unidades_por_paquete: Number(data.unidades_por_paquete),
    costo_paquete: Number(data.costo_paquete),
  });
}

export async function updateSupply(id, data) {
  const fields = {};
  for (const k of ['tipo_insumo', 'nombre_insumo', 'gramaje', 'unidades_por_paquete', 'costo_paquete']) {
    if (data[k] !== undefined) {
      fields[k] = ['tipo_insumo', 'nombre_insumo'].includes(k) ? data[k] : Number(data[k]);
    }
  }
  await updateItem(TABLES.supplies, id, fields);
}

export async function deleteSupply(id) {
  await deleteItem(TABLES.supplies, id);
}

// ── Processes ─────────────────────────────────────────────────

export async function getProcesses() {
  return getAll(TABLES.processes);
}

export async function createProcess(data) {
  return putItem(TABLES.processes, { nombre: data.nombre });
}

export async function updateProcess(id, data) {
  await updateItem(TABLES.processes, id, { nombre: data.nombre });
}

export async function deleteProcess(id) {
  await deleteItem(TABLES.processes, id);
}

// ── Pricing ───────────────────────────────────────────────────

export async function getPricing() {
  const items = await getAll(TABLES.pricing);
  const processes = await getProcesses();
  const procMap = {};
  processes.forEach(p => procMap[p.id] = p.nombre);
  return items.map(i => ({ ...i, proceso: procMap[i.id_proceso] || 'Desconocido' }));
}

export async function createPricing(data) {
  return putItem(TABLES.pricing, {
    id_proceso: data.id_proceso,
    cantidad_minima: Number(data.cantidad_minima),
    cantidad_maxima: Number(data.cantidad_maxima),
    valor_aplicado: Number(data.valor_aplicado),
  });
}

export async function updatePricing(id, data) {
  const fields = {};
  for (const k of ['id_proceso', 'cantidad_minima', 'cantidad_maxima', 'valor_aplicado']) {
    if (data[k] !== undefined) {
      fields[k] = k === 'id_proceso' ? data[k] : Number(data[k]);
    }
  }
  await updateItem(TABLES.pricing, id, fields);
}

export async function deletePricing(id) {
  await deleteItem(TABLES.pricing, id);
}

// ── Quotation helper: get all data needed for engine ──────────

export async function getAllData() {
  const [machines, supplies, processes, pricing] = await Promise.all([
    getMachines(), getSupplies(), getProcesses(), getPricing(),
  ]);
  return { machines, supplies, processes, pricing };
}
