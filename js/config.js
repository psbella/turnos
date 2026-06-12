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
    FECHA_INICIO_CICLO_1 = new Date(config.FECHA_INICIO_CICLO_1);
    console.log('Configuración cargada:', FECHA_INICIO_CICLO_1);
  } catch (error) {
    console.warn('No se pudo cargar config.json, usando fecha por defecto');
    FECHA_INICIO_CICLO_1 = new Date(2026, 3, 26, 9, 0, 0);
  }
}
