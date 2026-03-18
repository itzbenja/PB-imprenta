/**
 * main.js — App entry point (Firebase Edition).
 * Fetches allData from Firestore, wires form → engine → results.
 * Includes toggle to Admin panel for price management.
 * Admin panel protected by Firebase Authentication.
 */

import './style.css';
import { renderForm } from './ui/form.js';
import { renderResults } from './ui/results.js';
import { renderAdmin } from './ui/admin.js';
import { renderCalculator } from './ui/calculator.js';
import { generateQuotation } from './engine/quotation.js';
import { getAllData, saveCotizacion } from './db/firestore-api.js';
import { login, logout, isLoggedIn, onAuthChange } from './db/auth.js';

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

    function renderLoginForm() {
      const container = document.getElementById('adminContainer');
      if (!container) return;
      container.innerHTML = `
        <div style="max-width:380px;margin:4rem auto;padding:2rem;background:var(--surface-2,#1e1e1e);border-radius:12px;border:1px solid #333;">
          <h3 style="margin:0 0 1.5rem;text-align:center;">🔒 Acceso Admin</h3>
          <div id="loginError" style="display:none;color:#f87171;font-size:0.85rem;margin-bottom:1rem;padding:0.5rem;background:#3f1212;border-radius:6px;"></div>
          <div style="display:flex;flex-direction:column;gap:0.75rem;">
            <input type="email" id="adminEmail" placeholder="Correo electrónico"
              style="padding:0.6rem 0.8rem;background:#111;border:1px solid #444;border-radius:6px;color:#fff;font-size:0.95rem;" />
            <input type="password" id="adminPassword" placeholder="Contraseña"
              style="padding:0.6rem 0.8rem;background:#111;border:1px solid #444;border-radius:6px;color:#fff;font-size:0.95rem;" />
            <button id="btnLogin" style="padding:0.65rem;background:#22c55e;color:#000;font-weight:700;border:none;border-radius:6px;cursor:pointer;font-size:0.95rem;">
              Iniciar sesión
            </button>
          </div>
        </div>
      `;

      const emailInput = container.querySelector('#adminEmail');
      const passInput  = container.querySelector('#adminPassword');
      const btnLogin   = container.querySelector('#btnLogin');
      const errorDiv   = container.querySelector('#loginError');

      async function doLogin() {
        btnLogin.textContent = 'Entrando...';
        btnLogin.disabled = true;
        errorDiv.style.display = 'none';
        try {
          await login(emailInput.value.trim(), passInput.value);
        } catch {
          errorDiv.textContent = 'Correo o contraseña incorrectos.';
          errorDiv.style.display = 'block';
          btnLogin.textContent = 'Iniciar sesión';
          btnLogin.disabled = false;
        }
      }

      btnLogin.addEventListener('click', doLogin);
      passInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    }

    function renderApp() {
      const loggedIn     = isLoggedIn();
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
            ${loggedIn && isAdmin ? `<button id="btnLogout" class="toggle-btn" style="opacity:0.6;font-size:0.8rem;">🚪 Salir</button>` : ''}
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
      document.getElementById('btnQuotation').addEventListener('click', async () => {
        if (currentView !== 'quotation') {
          const wasAdmin = currentView === 'admin';
          currentView = 'quotation';
          if (wasAdmin) allData = await getAllData();
          renderApp();
        }
      });
      document.getElementById('btnCalculator').addEventListener('click', () => {
        if (currentView !== 'calculator') { currentView = 'calculator'; renderApp(); }
      });
      document.getElementById('btnAdmin').addEventListener('click', () => {
        if (currentView !== 'admin') { currentView = 'admin'; renderApp(); }
      });
      document.getElementById('btnLogout')?.addEventListener('click', async () => {
        await logout();
        renderApp();
      });

      if (isAdmin) {
        if (loggedIn) {
          renderAdmin(document.getElementById('adminContainer'), async () => {
            allData = await getAllData();
          });
        } else {
          renderLoginForm();
        }
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

    // Re-render cuando cambia el estado de auth (login/logout)
    onAuthChange(() => {
      if (currentView === 'admin') renderApp();
    });

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
