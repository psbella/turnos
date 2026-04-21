const axios = require("axios");
const fs = require("fs");

function formatearFecha() {
  const d = new Date();

  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

async function fetchHTML(fecha) {
  const url = `https://turnos.colfmarmamdp.com/ajax/buscaturno2.php?fecha=${fecha}`;

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html,application/xhtml+xml",
      "Referer": "https://turnos.colfarmamdp.com.ar/"
    }
  });

  console.log("STATUS:", res.status);
  console.log("DATA LENGTH:", res.data?.length || 0);

  return res.data;
}

function parsear(html) {
  const lines = html
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const farmacias = [];
  let actual = null;

  for (const line of lines) {
    // Detecta farmacia en formato [NOMBRE]
    const match = line.match(/\[(.*?)\]/);

    if (match) {
      if (actual) farmacias.push(actual);

      actual = {
        farmacia: match[1],
        direccion: "",
        telefono: ""
      };
      continue;
    }

    if (!actual) continue;

    // dirección (heurística simple)
    if (!actual.direccion && !line.includes("http") && !line.includes("[")) {
      actual.direccion = line;
      continue;
    }

    // teléfono (números)
    if (line.match(/[0-9]{3,}/)) {
      actual.telefono = line;
    }
  }

  if (actual) farmacias.push(actual);

  return farmacias;
}

async function run() {
  try {
    const fecha = formatearFecha();

    console.log("Fecha usada:", fecha);

    const html = await fetchHTML(fecha);

    console.log("RAW preview:", html.slice(0, 300));

    const farmacias = parsear(html);

    console.log("Farmacias encontradas:", farmacias.length);

    // 📦 data actual
    const dataFinal = {
      fecha,
      farmacias
    };

    fs.writeFileSync("data.json", JSON.stringify(dataFinal, null, 2));

    // 📜 histórico
    let historico = {};

    if (fs.existsSync("historico.json")) {
      historico = JSON.parse(fs.readFileSync("historico.json"));
    }

    historico[fecha] = farmacias;

    fs.writeFileSync("historico.json", JSON.stringify(historico, null, 2));

    console.log("✔ Actualización completa");

  } catch (err) {
    console.error("ERROR SCRAPER:", err.message);
  }
}

run();
