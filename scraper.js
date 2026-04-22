const res = await axios.get(url, {
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Referer": "http://turnos.colfarmamdp.com.ar/",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "es-AR,es;q=0.9",
    "Connection": "keep-alive"
  },
  timeout: 10000
});
const fs = require("fs");

function generarFechas(cantidadDias) {
  const fechas = [];
  const hoy = new Date();

  for (let i = 0; i < cantidadDias; i++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() + i);

    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const año = d.getFullYear();

    fechas.push(`${dia}/${mes}/${año}`);
  }

  return fechas;
}

async function run() {
  const fechas = generarFechas(16); // 🔥 16 ciclos

  const resultados = [];

  for (const fecha of fechas) {
    const url = `http://turnos.colfarmamdp.com.ar/ajax/buscaturno2.php?fecha=${fecha}`;

    console.log("Consultando:", fecha);

    try {
      const res = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 10000
      });

      const texto = res.data;

      const farmacias = [];

const regex = /\[(.*?)\].*\n(.*?)\n(.*)/g;

let match;

while ((match = regex.exec(texto)) !== null) {
  farmacias.push({
    farmacia: match[1].trim(),
    direccion: match[2].trim(),
    telefono: match[3].trim()
  });
}

      const lines = texto.split("\n");

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("http")) {
          const nombre = lines[i].replace(/[\[\]]/g, "").trim();
          const direccion = lines[i + 1]?.trim();
          const telefono = lines[i + 2]?.trim();

          farmacias.push({
            farmacia: nombre,
            direccion,
            telefono
          });
        }
      }

      resultados.push({
        fecha,
        farmacias
      });

    } catch (err) {
      console.log("Error en", fecha, err.message);
    }
  }

  fs.writeFileSync(
    "data.json",
    JSON.stringify(resultados, null, 2)
  );

  console.log("RESPUESTA:", texto.slice(0, 500));
}

run();