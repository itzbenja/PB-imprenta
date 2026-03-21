/**
 * main.js — App entry point (Firebase Edition).
 * Fetches allData from Firestore, wires form → engine → results.
 * Includes toggle to Admin panel for price management.
 * Admin panel protected by Firebase Authentication.
 */

import './style.css';
import { renderAdmin } from './ui/admin.js';
import { renderCalculator } from './ui/calculator.js';
import { renderQuickQuote } from './ui/quick-quote.js';
import { getAllData } from './db/firestore-api.js';
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

    let currentView = 'quickquote'; // 'quickquote' | 'admin' | 'calculator'

    function renderLoginForm() {
      const container = document.getElementById('adminContainer');
      if (!container) return;
      container.innerHTML = `
        <div style="max-width:400px;margin:6rem auto;padding:2.5rem;background:linear-gradient(135deg, rgba(26,92,46,0.15), rgba(0,0,0,0.4));border-radius:16px;border:1px solid rgba(34,197,94,0.2);backdrop-filter:blur(10px);">
          <div style="text-align:center;margin-bottom:2rem;">
            <div style="width:64px;height:64px;margin:0 auto 1rem;background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:50%;display:flex;align-items:center;justify-content:center;">
              <svg width="28" height="28" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 style="margin:0;font-size:1.3rem;font-weight:700;color:#e5e5e5;">Panel de Administración</h3>
            <p style="margin:0.4rem 0 0;font-size:0.8rem;color:#888;">Ingrese sus credenciales para continuar</p>
          </div>
          <div id="loginError" style="display:none;color:#f87171;font-size:0.85rem;margin-bottom:1rem;padding:0.6rem 0.8rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;"></div>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            <div>
              <label for="adminEmail" style="display:block;font-size:0.75rem;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.4rem;font-weight:600;">Correo electrónico</label>
              <input type="email" id="adminEmail" placeholder="admin@pbimprenta.cl"
                style="width:100%;padding:0.7rem 0.9rem;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:0.95rem;outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'" />
            </div>
            <div>
              <label for="adminPassword" style="display:block;font-size:0.75rem;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.4rem;font-weight:600;">Contraseña</label>
              <input type="password" id="adminPassword" placeholder="••••••••"
                style="width:100%;padding:0.7rem 0.9rem;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:0.95rem;outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'" />
            </div>
            <button id="btnLogin" style="padding:0.75rem;margin-top:0.5rem;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-weight:700;border:none;border-radius:8px;cursor:pointer;font-size:0.95rem;letter-spacing:0.3px;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
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

    // ── Build layout once ──────────────────────────────────────
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
          <button id="btnQuickQuote" class="toggle-btn active">💰 Cotizar</button>
          <button id="btnCalculator" class="toggle-btn">✂️ Cortes</button>
          <button id="btnAdmin" class="toggle-btn">⚙️ Precios</button>
          <button id="btnLogout" class="toggle-btn" style="display:none;opacity:0.6;font-size:0.8rem;">🚪 Salir</button>
        </div>
      </nav>
      <div id="quickQuoteContainer"></div>
      <div id="calculatorContainer" style="display:none;"></div>
      <div id="adminContainer" style="display:none;"></div>
    `;

    // ── Render components once ─────────────────────────────────
    const qqContainer = document.getElementById('quickQuoteContainer');
    const calcContainer = document.getElementById('calculatorContainer');
    const adminCont = document.getElementById('adminContainer');
    const btnQQ = document.getElementById('btnQuickQuote');
    const btnCalc = document.getElementById('btnCalculator');
    const btnAdm = document.getElementById('btnAdmin');
    const btnOut = document.getElementById('btnLogout');

    renderQuickQuote(qqContainer, allData);
    renderCalculator(calcContainer);

    let adminRendered = false;

    function switchView(view) {
      currentView = view;
      qqContainer.style.display = view === 'quickquote' ? '' : 'none';
      calcContainer.style.display = view === 'calculator' ? '' : 'none';
      adminCont.style.display = view === 'admin' ? '' : 'none';
      btnQQ.classList.toggle('active', view === 'quickquote');
      btnCalc.classList.toggle('active', view === 'calculator');
      btnAdm.classList.toggle('active', view === 'admin');
      btnOut.style.display = (view === 'admin' && isLoggedIn()) ? '' : 'none';
    }

    function renderAdminView() {
      if (isLoggedIn()) {
        renderAdmin(adminCont, async () => { allData = await getAllData(); });
        adminRendered = true;
      } else {
        renderLoginForm();
      }
    }

    btnQQ.addEventListener('click', async () => {
      if (currentView === 'admin') {
        allData = await getAllData();
        renderQuickQuote(qqContainer, allData);
      }
      switchView('quickquote');
    });
    btnCalc.addEventListener('click', () => switchView('calculator'));
    btnAdm.addEventListener('click', () => {
      switchView('admin');
      if (!adminRendered) renderAdminView();
    });
    btnOut.addEventListener('click', async () => {
      await logout();
      adminRendered = false;
      renderAdminView();
    });

    function renderApp() {
      if (currentView === 'admin') renderAdminView();
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
