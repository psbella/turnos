// ==================== CONFIGURACIÓN GLOBAL ====================
export const CONFIG = {
  HORA_CAMBIO: 9,
  ZONA_HORARIA: 'America/Argentina/Buenos_Aires',
  RUTA_JSON: 'db.json'
};

export let FECHA_INICIO_CICLO_1 = null;

export async function cargarConfiguracion() {
  try {
    const response = await fetch('config.json');
    const config = await response.json();
    
    // Parsear manualmente la fecha GMT-3 (evita problemas de zona horaria)
    const fechaStr = config.FECHA_INICIO_CICLO_1;
    const [fechaParte, horaParte] = fechaStr.split('T');
    const [anio, mes, dia] = fechaParte.split('-').map(Number);
    const [hora, minuto, segundo] = horaParte.split(':').map(Number);
    
    // Crear fecha en GMT-3 manualmente (mes es 0-index)
    FECHA_INICIO_CICLO_1 = new Date(anio, mes - 1, dia, hora, minuto, segundo);
    
    console.log('Configuración cargada:', FECHA_INICIO_CICLO_1);
  } catch (error) {
    console.warn('No se pudo cargar config.json, usando fecha por defecto');
    FECHA_INICIO_CICLO_1 = new Date(2026, 3, 26, 9, 0, 0);
  }
}
