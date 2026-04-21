const axios = require("axios");
const fs = require("fs");

async function scrape() {
  try {
    const { data } = await axios.get("https://www.0223.com.ar/s/turnf", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.0223.com.ar/",
        "Origin": "https://www.0223.com.ar"
      }
    });

    // 🔥 DEBUG (clave)
    console.log("RAW:", JSON.stringify(data).slice(0, 200));

    const farmacias = data
      .filter(x => x.name)
      .map(f => ({
        farmacia: f.name,
        direccion: f.address,
        telefono: f.phone
      }));

    const fecha = `${data[0]?.dia}/${data[0]?.mes}/2026`;

    const resultado = {
      fecha,
      cantidad: farmacias.length,
      farmacias,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync("data.json", JSON.stringify(resultado, null, 2));

    let historico = {};
    if (fs
