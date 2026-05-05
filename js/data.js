import { CONFIG, FECHA_INICIO_CICLO_1 } from './config.js';

export let ciclosData = {};
export let farmaciasCoords = [];

export function formatearFechaGMT3() {
  const a = new Date();
  const o = { timeZone: CONFIG.ZONA_HORARIA };
  return new Date(a.toLocaleString('en-US', o));
}

export function limpiarTelefono(t) {
  return (!t || t === 'nan' || t === 'NaN' || t === 'null') ? '' : t.replace(/\s/g, '');
}

export function obtenerCicloActual() {
  const ahora = formatearFechaGMT3();
  const totalCiclos = Object.keys(ciclosData).length || 16;
  if (totalCiclos === 0) return 1;

  const fechaBase = new Date(FECHA_INICIO_CICLO_1);
  fechaBase.setHours(CONFIG.HORA_CAMBIO, 0, 0, 0);

  let fechaActual = new Date(ahora);
  
  // Si es antes de la hora de cambio, usar el día anterior
  if (ahora.getHours() < CONFIG.HORA_CAMBIO) {
    fechaActual.setDate(fechaActual.getDate() - 1);
  }
  fechaActual.setHours(CONFIG.HORA_CAMBIO, 0, 0, 0);

  const diffDias = Math.floor((fechaActual - fechaBase) / 86400000);
  let ciclo = (diffDias % totalCiclos) + 1;
  if (ciclo <= 0) ciclo += totalCiclos;
  return ciclo;
}

export async function cargarDatos() {
  const intro = document.getElementById('intro');
  intro.innerHTML = '<span>Cargando datos...</span>';
  try {
    const r = await fetch(CONFIG.RUTA_JSON + '?t=' + Date.now());
    if (!r.ok) throw new Error('HTTP ' + r.status);
    ciclosData = await r.json();
    return true;
  } catch (e) {
    console.error('Error al cargar db.json:', e);
    intro.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#f85149"/></svg> Error al cargar datos</span>';
    document.getElementById('lista').innerHTML = '<div class="card">No se pudieron cargar las farmacias</div>';
    return false;
  }
}
