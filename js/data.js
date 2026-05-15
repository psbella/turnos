import { CONFIG, FECHA_INICIO_CICLO_1 } from './config.js';

export let ciclosData = {};
export let farmaciasCoords = [];
export let turnosMensuales = {}; // Cache de archivos mensuales

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

export function obtenerCicloActual() {
  const ahora = formatearFechaGMT3();
  const totalCiclos = Object.keys(ciclosData).filter(k => !isNaN(k)).length;
  if (totalCiclos === 0) return 1;

  let fechaBase = new Date(FECHA_INICIO_CICLO_1);
  let fechaActual = new Date(ahora);

  if (fechaActual.getHours() < CONFIG.HORA_CAMBIO) {
    fechaActual.setDate(fechaActual.getDate() - 1);
  }
  fechaBase.setHours(CONFIG.HORA_CAMBIO, 0, 0, 0);
  fechaActual.setHours(CONFIG.HORA_CAMBIO, 0, 0, 0);

  const diffDias = Math.floor((fechaActual - fechaBase) / 86400000);
  let ciclo = (diffDias % totalCiclos) + 1;
  if (ciclo <= 0) ciclo = 1;
  return ciclo;
}

export function obtenerCicloFinde() {
  const ahora = formatearFechaGMT3();
  const diaSemana = ahora.getDay();
  
  if (diaSemana === 6) { // sábado
    const fechaBase = new Date(2026, 4, 2); // 02/05/2026
    const diffSemanas = Math.floor((ahora - fechaBase) / (1000 * 60 * 60 * 24 * 7));
    return 's' + ((diffSemanas % 16) + 1);
  }
  
  if (diaSemana === 0) { // domingo
    const fechaBase = new Date(2026, 4, 3); // 03/05/2026
    const diffSemanas = Math.floor((ahora - fechaBase) / (1000 * 60 * 60 * 24 * 7));
    return 'd' + ((diffSemanas % 16) + 1);
  }
  
  return null;
}

function formatearFechaArchivo(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

async function cargarTurnosMes(mes, anio) {
  const key = `${anio}_${String(mes).padStart(2, '0')}`;
  
  // Si ya lo tenemos en caché, devolverlo
  if (turnosMensuales[key]) return turnosMensuales[key];
  
  try {
    const url = `turnos_${key}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    turnosMensuales[key] = data;
    return data;
  } catch (e) {
    console.warn(`No se pudo cargar ${url}:`, e.message);
    return null;
  }
}

export async function obtenerFarmaciasDelDia() {
  const fecha = formatearFechaTurno();
  const fechaStr = formatearFechaArchivo(fecha);
  
  // Intentar cargar del archivo mensual scrapeado
  const mes = fecha.getMonth() + 1;
  const anio = fecha.getFullYear();
  const turnosMes = await cargarTurnosMes(mes, anio);
  
  if (turnosMes && turnosMes[fechaStr]) {
    // ¡Lo tenemos! Devolver los datos scrapeados
    return turnosMes[fechaStr].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  
  // Fallback: calcular con la lógica de ciclos
  const cicloFinde = obtenerCicloFinde();
  
  if (cicloFinde) {
    const tipo = cicloFinde[0] === 's' ? 'sabados' : 'domingos';
    const grupo = ciclosData[tipo] || {};
    return [...(grupo[cicloFinde] || [])].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  
  const ciclo = obtenerCicloActual();
  return [...(ciclosData[ciclo] || [])].sort((a, b) => a.nombre.localeCompare(b.nombre));
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
