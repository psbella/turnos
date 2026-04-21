const axios = require('axios');

async function obtenerFarmacias(fecha) {
  const url = `https://turnos.colfmarmamdp.com/ajax/buscaturno2.php?fecha=${fecha}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Node.js)',
      },
    });

    console.log('Respuesta completa:', response.data);

    // Si esperás JSON y es un string, intentá parsearlo (si es necesario)
    try {
      const data = JSON.parse(response.data);
      console.log('Datos parseados:', data);
    } catch (e) {
      console.log('No se pudo parsear como JSON, se recibió:', response.data);
    }

  } catch (error) {
    console.error('Error en la petición:', error.message);
  }
}

obtenerFarmacias('2026
