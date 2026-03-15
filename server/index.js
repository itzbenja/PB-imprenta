/**
 * index.js — Express.js Backend API for Quotation System.
 * Serves endpoints connecting to DynamoDB.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  getMachines, createMachine, updateMachine, deleteMachine,
  getSupplies, createSupply, updateSupply, deleteSupply,
  getProcesses, createProcess, updateProcess, deleteProcess,
  getPricing, createPricing, updatePricing, deletePricing,
  getAllData, ensureTables
} from './dynamo.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Machines ──────────────────────────────────────────────────
app.get('/api/machines', async (req, res) => {
  try { res.json(await getMachines()); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/machines', async (req, res) => {
  try { res.json(await createMachine(req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/machines/:id', async (req, res) => {
  try { await updateMachine(req.params.id, req.body); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/machines/:id', async (req, res) => {
  try { await deleteMachine(req.params.id); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Supplies ──────────────────────────────────────────────────
app.get('/api/supplies', async (req, res) => {
  try { res.json(await getSupplies()); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/supplies', async (req, res) => {
  try { res.json(await createSupply(req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/supplies/:id', async (req, res) => {
  try { await updateSupply(req.params.id, req.body); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/supplies/:id', async (req, res) => {
  try { await deleteSupply(req.params.id); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Processes ─────────────────────────────────────────────────
app.get('/api/processes', async (req, res) => {
  try { res.json(await getProcesses()); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/processes', async (req, res) => {
  try { res.json(await createProcess(req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/processes/:id', async (req, res) => {
  try { await updateProcess(req.params.id, req.body); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/processes/:id', async (req, res) => {
  try { await deleteProcess(req.params.id); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Pricing ───────────────────────────────────────────────────
app.get('/api/pricing', async (req, res) => {
  try { res.json(await getPricing()); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/pricing', async (req, res) => {
  try { res.json(await createPricing(req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/pricing/:id', async (req, res) => {
  try { await updatePricing(req.params.id, req.body); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/pricing/:id', async (req, res) => {
  try { await deletePricing(req.params.id); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── All Data Dump (for Form initialize) ───────────────────────
app.get('/api/all-data', async (req, res) => {
  try {
    res.json(await getAllData());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Boot ──────────────────────────────────────────────────────
async function start() {
  try {
    await ensureTables();
    app.listen(PORT, () => {
      console.log(`🚀 API Server running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

start();
