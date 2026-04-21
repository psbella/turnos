const axios = require("axios");
const fs = require("fs");

function hoy() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

async function run() {
  try {
    const fecha = hoy();

    const url = `https://turnos.colfmarmamdp.com/ajax/buscaturno2.php?fecha=${fecha}`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-AR,es;q=0.9",
        "Referer": "https://turnos.colfarmamdp.com.ar/"
      }
    });

    const html = res.data;

    console.log("STATUS:", res.status);
    console.log("SIZE:", html?.length || 0);

    // 🔥 DEBUG REAL (clave para tu caso)
    fs.writeFileSync("debug_raw.html", html);

    // ─────────────────────────────
    // PARSER ROBUSTO
    // ─────────────────────────────

    const lines = html.split(/\n+/).map(l => l.trim()).filter(Boolean);

    const farmacias = [];
    let actual = null;

    for (const line of lines) {
      // nombre farmacia
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

      // dirección (heurística: línea sin links ni tags)
      if (!actual.direccion && !line.includes("http") && line.length > 5) {
        actual.direccion = line;
        continue;
      }

      // teléfono (números)
      if (/\d{3,}/.test(line)) {
        actual.telefono = line;
      }
    }

    if (actual) farmacias.push(actual);

    const output = {
      fecha,
      farmacias
    };

    fs.writeFileSync("data.json", JSON.stringify(output, null, 2));

    // histórico
    let historico = {};

    if (fs.existsSync("historico.json")) {
      historico = JSON.parse(fs.readFileSync("historico.json"));
    }

    historico[fecha] = farmacias;

    fs.writeFileSync("historico.json", JSON.stringify(historico, null, 2));

    console.log("✔ FARMACIAS ENCONTRADAS:", farmacias.length);

  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

run();
