import { CONFIG, FECHA_INICIO_CICLO_1 } from './config.js';

export let ciclosData = {};
export let farmaciasCoords = [];

export function formatearFechaGMT3() {
  const a = new Date();
  const o = { timeZone: CONFIG.ZONA_HORARIA };
  return new Date(a.toLocaleString('en-US', o));
}

export function formatearFechaTurno() {
  const ahora = formatearFechaGMT3();
  const fechaTurno = new Date(ahora);
  if (ahora.getHours() < CONFIG.HORA_CAMBIO) {
    fechaTurno.setDate(fechaTurno.getDate() - 1);
  }
  fechaTurno.setHours(0, 0, 0, 0);
  return fechaTurno;
}

export function limpiarTelefono(t) {
  return (!t || t === 'nan' || t === 'NaN' || t === 'null') ? '' : t.replace(/\s/g, '');
}

function obtenerTurnoPorDia(dia) {
  for (let t = 1; t <= 6; t++) {
    if (dia === t + 10 || dia === t + 26) return t;
  }
  for (let t = 7; t <= 16; t++) {
    if (dia === t - 6 || dia === t + 10) return t;
  }
  return null;
}

export function obtenerCicloActual() {
  const ahora = formatearFechaGMT3();
  let fechaTurno = new Date(ahora);
  
  if (ahora.getHours() < CONFIG.HORA_CAMBIO) {
    fechaTurno.setDate(fechaTurno.getDate() - 1);
  }
  
  const dia = fechaTurno.getDate();
  const turno = obtenerTurnoPorDia(dia);
  
  if (turno) return turno;
  
  // Fallback
  const totalCiclos = Object.keys(ciclosData).filter(k => !isNaN(k)).length || 16;
  const fechaBase = new Date(FECHA_INICIO_CICLO_1);
  fechaBase.setHours(CONFIG.HORA_CAMBIO, 0, 0, 0);
  const fechaCalc = new Date(fechaTurno);
  fechaCalc.setHours(CONFIG.HORA_CAMBIO, 0, 0, 0);
  const diffDias = Math.floor((fechaCalc - fechaBase) / 86400000);
  return (diffDias % totalCiclos) + 1;
}

export async function obtenerFarmaciasDelDia() {
  const ciclo = obtenerCicloActual();
  const farmacias = ciclosData[ciclo] || [];
  return [...farmacias].sort((a, b) => a.nombre.localeCompare(b.nombre));
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