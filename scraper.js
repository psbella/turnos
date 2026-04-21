const fetch = require('node-fetch');

async function obtenerFarmacias(fecha) {
  const url = `https://turnos.colfmarmamdp.com/ajax/buscaturno2.php?fecha=${fecha}`;
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Node.js)',
    },
  });

  if (!res.ok) {
    throw new Error(`Error en la petición: ${res.status}`);
  }

  const data = await res.json();
  console.log(data);
}

obtenerFarmacias('2026-04-21').
