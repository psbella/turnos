import { CONFIG, FECHA_INICIO_CICLO_1 } from './config.js';

export let ciclosData = {};
export let farmaciasCoords = [];

export function formatearFechaGMT3() {
  // Método directo sin toLocaleString - EVITA desfases de 1 día
  const ahora = new Date();
  const offsetLocal = ahora.getTimezoneOffset();
  const offsetGMT3 = 180; // GMT-3 son -3 horas = +180 minutos desde UTC
  const diffMinutos = -offsetLocal + offsetGMT3;
  const fechaGMT3 = new Date(ahora.getTime() + diffMinutos * 60000);
  return fechaGMT3;
}

export function limpiarTelefono(t) {
  return (!t || t === 'nan' || t === 'NaN' || t === 'null') ? '' : t.replace(/\s/g, '');
}

export function obtenerCicloActual() {
  const ahora = formatearFechaGMT3();
  const totalCiclos = Object.keys(ciclosData).length;
  if (totalCiclos === 0) return 1;

  // Hora actual (0-23)
  const horaActual = ahora.getHours();
  
  // Fecha base del ciclo 1 (domingo 26/4/2026 a las 9am)
  let fechaBase = new Date(FECHA_INICIO_CICLO_1);
  fechaBase.setHours(9, 0, 0, 0);
  
  // Fecha de inicio del turno actual
  let inicioTurno = new Date(ahora);
  
  // Si la hora actual es ANTES de las 9am, el turno vigente comenzó AYER a las 9am
  if (horaActual < 9) {
    inicioTurno.setDate(inicioTurno.getDate() - 1);
  }
  
  // Normalizar a las 9am (hora de inicio del turno)
  inicioTurno.setHours(9, 0, 0, 0);
  
  // Calcular cuántos días pasaron desde la fecha base
  const diffDias = Math.floor((inicioTurno - fechaBase) / 86400000);
  
  // El ciclo se define por la cantidad de días desde la base
  let ciclo = (diffDias % totalCiclos) + 1;
  
  // Caso borde: asegurar ciclo positivo
  if (ciclo <= 0) ciclo = 1;
  
  console.log('📆 Cálculo turno:', {
    ahora: ahora.toLocaleString(),
    horaActual,
    inicioTurno: inicioTurno.toLocaleString(),
    diffDias,
    ciclo
  });
  
  return ciclo;
}

export async function cargarDatos() {
  const intro = document.getElementById('intro');
  intro.innerHTML = '<span>Cargando datos...</span>';
  try {
    const r = await fetch(CONFIG.RUTA_JSON);
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
