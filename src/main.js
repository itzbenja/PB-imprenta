/**
 * main.js — App entry point (Firebase Edition).
 * Fetches allData from Firestore, wires form → engine → results.
 * Includes toggle to Admin panel for price management.
 */

import './style.css';
import { renderForm } from './ui/form.js';
import { renderResults } from './ui/results.js';
import { renderAdmin } from './ui/admin.js';
import { renderCalculator } from './ui/calculator.js';
import { generateQuotation } from './engine/quotation.js';
import { getAllData, saveCotizacion } from './db/firestore-api.js';

async function main() {
  const app = document.getElementById('app');

  // ── Loading state ───────────────────────────────────────────
  app.innerHTML = `
    <nav class="navbar">
      <div class="navbar-brand">
        <img src="/logo.png" alt="PB" class="nav-logo" />
        <div class="navbar-text">
          <span class="nav-title">Cotizador Imprenta</span>
          <span class="nav-sub">PB Impresión y Terminación</span>
        </div>
      </div>
    </nav>
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

    let currentView = 'quotation'; // 'quotation' | 'admin' | 'calculator'

    function renderApp() {
      const isAdmin      = currentView === 'admin';
      const isCalculator = currentView === 'calculator';
      const isQuotation  = currentView === 'quotation';

      app.innerHTML = `
        <nav class="navbar">
          <div class="navbar-brand">
            <img src="/logo.png" alt="PB" class="nav-logo" />
            <div class="navbar-text">
              <span class="nav-title">Cotizador Imprenta</span>
              <span class="nav-sub">PB Impresión y Terminación</span>
            </div>
          </div>
          <div class="navbar-actions">
            <button id="btnQuotation" class="toggle-btn ${isQuotation ? 'active' : ''}">
              💰 Cotizar
            </button>
            <button id="btnCalculator" class="toggle-btn ${isCalculator ? 'active' : ''}">
              ✂️ Cortes
            </button>
            <button id="btnAdmin" class="toggle-btn ${isAdmin ? 'active' : ''}">
              ⚙️ Precios
            </button>
          </div>
        </nav>
        ${isAdmin
          ? `<div id="adminContainer"></div>`
          : isCalculator
          ? `<div id="calculatorContainer"></div>`
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
      document.getElementById('btnCalculator').addEventListener('click', () => {
        if (currentView !== 'calculator') { currentView = 'calculator'; renderApp(); }
      });
      document.getElementById('btnAdmin').addEventListener('click', () => {
        if (currentView !== 'admin') { currentView = 'admin'; renderApp(); }
      });

      if (isAdmin) {
        renderAdmin(document.getElementById('adminContainer'), async () => {
          allData = await getAllData();
        });
      } else if (isCalculator) {
        renderCalculator(document.getElementById('calculatorContainer'));
      } else {
        const formContainer    = document.getElementById('formContainer');
        const resultsContainer = document.getElementById('resultsContainer');
        renderForm(formContainer, allData, (formData) => {
          const quote = generateQuotation(allData, formData);
          renderResults(resultsContainer, quote);
          if (quote && !quote.error) {
            saveCotizacion(quote, formData).catch(console.error);
          }
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
