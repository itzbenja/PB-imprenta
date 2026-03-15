/**
 * main.js — App entry point (Firebase Edition).
 * Fetches allData from Firestore, wires form → engine → results.
 * Includes toggle to Admin panel for price management.
 */

import './style.css';
import { renderForm } from './ui/form.js';
import { renderResults } from './ui/results.js';
import { renderAdmin } from './ui/admin.js';
import { generateQuotation } from './engine/quotation.js';
import { getAllData } from './db/firestore-api.js';

async function main() {
  const app = document.getElementById('app');

  // ── Loading state ───────────────────────────────────────────
  app.innerHTML = `
    <div class="app-header">
      <img src="/logo.png" alt="PB Impresión y Terminación" class="logo" />
      <h1>Cotizador Imprenta</h1>
      <p class="brand-name">PB Impresión y Terminación</p>
      <p class="subtitle">Motor de cotización automatizado</p>
    </div>
    <div id="loading" class="active">
      <div class="spinner"></div>
      <p>Conectando a Firebase...</p>
    </div>
  `;

  try {
    // ── Fetch all data from Firestore ─────────────────────────
    let allData = await getAllData();

    // ── Check if DB is empty ──────────────────────────────────
    if (allData.machines.length === 0) {
      app.innerHTML += `
        <div class="error-card" style="max-width:600px;margin:2rem auto;text-align:center;">
          <h3>⚠️ Base de datos vacía</h3>
          <p>Debemos poblar la base de datos de Firebase la primera vez.</p>
          <button id="btnSeed">Poblar Datos Iniciales</button>
        </div>
      `;
      document.getElementById('btnSeed').addEventListener('click', async () => {
        const { default: seedData } = await import('./db/seed-firestore.js');
        document.getElementById('btnSeed').textContent = 'Poblando...';
        await seedData();
        window.location.reload();
      });
      return;
    }

    let currentView = 'quotation'; // 'quotation' | 'admin'

    function renderApp() {
      const isAdmin = currentView === 'admin';

      app.innerHTML = `
        <div class="app-header">
          <img src="/logo.png" alt="PB Impresión y Terminación" class="logo" />
          <h1>Cotizador Imprenta</h1>
          <p class="brand-name">PB Impresión y Terminación</p>
          <p class="subtitle">Sistema automatizado de cotización — Productos editoriales y comerciales</p>
          <div class="view-toggle">
            <button id="btnQuotation" class="toggle-btn ${!isAdmin ? 'active' : ''}">
              <span class="icon">📊</span> Cotizar
            </button>
            <button id="btnAdmin" class="toggle-btn ${isAdmin ? 'active' : ''}">
              <span class="icon">⚙️</span> Administrar Precios
            </button>
          </div>
        </div>
        ${isAdmin
          ? `<div id="adminContainer"></div>`
          : `<div class="main-grid">
               <div class="form-container" id="formContainer"></div>
               <div id="resultsContainer"></div>
             </div>`
        }
      `;

      // Toggle buttons
      document.getElementById('btnQuotation').addEventListener('click', () => {
        if (currentView !== 'quotation') { currentView = 'quotation'; renderApp(); }
      });
      document.getElementById('btnAdmin').addEventListener('click', () => {
        if (currentView !== 'admin') { currentView = 'admin'; renderApp(); }
      });

      if (isAdmin) {
        // Admin panel fetches and modifies data directly, 
        // passing a callback to refresh allData so Form stays up to date.
        renderAdmin(document.getElementById('adminContainer'), async () => {
          allData = await getAllData();
        });
      } else {
        // Form & results read from pre-fetched allData
        const formContainer = document.getElementById('formContainer');
        const resultsContainer = document.getElementById('resultsContainer');
        renderForm(formContainer, allData, (formData) => {
          const quote = generateQuotation(allData, formData);
          renderResults(resultsContainer, quote);
        });
      }
    }

    renderApp();
  } catch (err) {
    console.error('Error initializing app:', err);
    app.innerHTML += `
      <div class="error-card" style="max-width:600px;margin:2rem auto;">
        <h3>⚠️ Error de inicialización</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}

main();
