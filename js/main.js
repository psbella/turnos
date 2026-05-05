import { cargarConfiguracion, FECHA_INICIO_CICLO_1 } from './config.js';
import { cargarDatos, ciclosData, obtenerCicloActual } from './data.js';
import { initMaps, limpiarMarcadores, agregarMarcadores, mapDesktop, mapMobile, markersDesktop, markersMobile } from './maps.js';
import { mostrarFarmacias, mostrarTodasLasFarmacias, volverATurno } from './ui.js';
import { initTheme, setupThemeSwitch } from './theme.js';
import { setupInstallPWA } from './install.js';

// Exponer mapas y marcadores como getters
Object.defineProperty(window, 'mapDesktop', { get: () => mapDesktop });
Object.defineProperty(window, 'mapMobile', { get: () => mapMobile });
Object.defineProperty(window, 'markersDesktop', { get: () => markersDesktop });
Object.defineProperty(window, 'markersMobile', { get: () => markersMobile });

// Función para el botón "Ir arriba"
function agregarBotonIrArriba() {
  if (!document.querySelector('.scroll-top-btn')) {
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 4v16M12 4l-4 4M12 4l4 4"/></svg>`;
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

// Exponer globalmente lo que necesitan otros módulos o la consola
window.initMaps = initMaps;
window.limpiarMarcadores = limpiarMarcadores;
window.agregarMarcadores = agregarMarcadores;
window.mostrarFarmacias = mostrarFarmacias;
window.obtenerCicloActual = obtenerCicloActual;
window.ciclosData = ciclosData;
window.mostrarTodasLasFarmacias = mostrarTodasLasFarmacias;
window.volverATurno = volverATurno;

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
