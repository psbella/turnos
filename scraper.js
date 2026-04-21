const axios = require("axios");
const fs = require("fs");

function hoy() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

async function run() {
  const fecha = hoy();

  const url = `https://turnos.colfmarmamdp.com/ajax/buscaturno2.php?fecha=${fecha}`;

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html",
      "Referer": "https://turnos.colfarmamdp.com.ar/"
    }
  });

  const text = res.data;

  console.log("STATUS:", res.status);
  console.log("SIZE:", text.length);

  // 🔥 REGEX REALISTA (captura bloques completos)
  const bloques = text.split(/\n+/);

  const farmacias = [];

  let actual = null;

  for (const l of bloques) {
    const nombre = l.match(/\[(.*?)\]/);

    if (nombre) {
      if (actual) farmacias.push(actual);

      actual = {
        farmacia: nombre[1],
        direccion: "",
        telefono: ""
      };
      continue;
    }

    if (!actual) continue;

    if (!actual.direccion && l.length > 5 && !l.includes("http")) {
      actual.direccion = l.trim();
      continue;
    }

    if (/\d{3,}/.test(l)) {
      actual.telefono = l.trim();
    }
  }

  if (actual) farmacias.push(actual);

  const data = {
    fecha,
    farmacias
  };

  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

  let hist = {};
  if (fs.existsSync("historico.json")) {
    hist = JSON.parse(fs.readFileSync("historico.json"));
  }

  hist[fecha] = farmacias;

  fs.writeFileSync("historico.json", JSON.stringify(hist, null, 2));

  console.log("OK FARMACIAS:", farmacias.length);
}

run();
