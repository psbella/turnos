import { cargarConfiguracion } from './config.js';
import { cargarDatos, ciclosData, obtenerCicloActual } from './data.js';
import { initMaps, limpiarMarcadores, agregarMarcadores } from './maps.js';
import { mostrarFarmacias, mostrarTodasLasFarmacias, volverATurno } from './ui.js';
import { initTheme, setupThemeSwitch } from './theme.js';
import { setupInstallPWA } from './install.js';

// Función para el botón "Ir arriba"
function agregarBotonIrArriba() {
  if (!document.querySelector('.scroll-top-btn')) {
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 4v16M12 4l-4 4M12 4l4 4"/></svg>`;
    btn.setAttribute('aria-label', 'Ir arriba');
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) btn.classList.add('visible');
      else btn.classList.remove('visible');
    });

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

function programarActualizacion() {
  const a = new Date();
  let p = new Date(a);
  p.setHours(9, 0, 0, 0);
  if (a >= p) p.setDate(p.getDate() + 1);
  setTimeout(() => {
    mostrarFarmacias();
    programarActualizacion();
  }, p - a);
}

// Exponer globalmente lo que necesita el HTML onclick
window.modoTodas = false;
window.volverATurno = volverATurno;
window.mostrarTodasLasFarmacias = mostrarTodasLasFarmacias;

// Inicialización
(async () => {
  initTheme();
  setupThemeSwitch();
  setupInstallPWA();
  await cargarConfiguracion();
  await cargarDatos();
  mostrarFarmacias();
  programarActualizacion();
  agregarBotonIrArriba();
})();

// Cerrar sheet
const closeSheetBtn = document.getElementById('closeSheet');
if (closeSheetBtn) {
  closeSheetBtn.onclick = () => document.getElementById('mapSheet').classList.remove('open');
}

// Botón "Ver todas"
const btnTodas = document.getElementById('btnTodasFarmacias');
if (btnTodas) {
  btnTodas.addEventListener('click', () => {
    if (window.modoTodas) volverATurno();
    else mostrarTodasLasFarmacias();
  });
}
