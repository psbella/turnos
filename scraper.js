const axios = require("axios");
const fs = require("fs");

async function obtenerFarmacias(fecha) {
  const url = `https://turnos.colfmarmamdp.com/ajax/buscaturno2.php?fecha=${fecha}`;

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  // 👇 ACÁ VA EL DIAGNÓSTICO
console.log("STATUS:", res.status);
console.log("DATA LENGTH:", res.data?.length);
console.log("DATA RAW:");
console.log(res.data);

  const html = res.data;

  const lines = html
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const farmacias = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(/\[(.*?)\]/);

    if (match) {
      if (current) farmacias.push(current);

      current = {
        farmacia: match[1],
        direccion: "",
        telefono: ""
      };
      continue;
    }

    if (!current) continue;

    if (!line.includes("http") && !line.match(/[A-Za-z\[\]]/) && !current.direccion) {
      current.direccion = line;
      continue;
    }

    if (line.match(/[0-9]{3,}/)) {
      current.telefono = line;
    }
  }

  if (current) farmacias.push(current);

  return farmacias;
}

async function run() {
  const hoy = new Date();

  const fecha = hoy.toLocaleDateString("es-AR"); // 21/04/2026

  const data = await obtenerFarmacias(fecha);

  console.log("Farmacias encontradas:", data.length);

  // 📦 guardar data principal
  fs.writeFileSync("data.json", JSON.stringify({ fecha, farmacias: data }, null, 2));

  // 📜 histórico
  let historico = {};
  if (fs.existsSync("historico.json")) {
    historico = JSON.parse(fs.readFileSync("historico.json"));
  }

  historico[fecha] = { farmacias: data };

  fs.writeFileSync("historico.json", JSON.stringify(historico, null, 2));

  console.log("✔ Actualizado correctamente");
}

run().catch(err => {
  console.error("Error scraper:", err.message);
});
