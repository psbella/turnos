const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

function getFechaHoy() {
  const hoy = new Date();
  const dd = String(hoy.getDate()).padStart(2, "0");
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const yyyy = hoy.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function scrape() {
  const fecha = getFechaHoy();

  const url = `http://colfarmamdp.com.ar/ajax/buscaturno2.php?fecha=${fecha}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "http://colfarmamdp.com.ar/"
      }
    });

    const $ = cheerio.load(data);
    const farmacias = [];

    $("#tabfarhoy tbody tr").each((i, el) => {
      const tds = $(el).find("td");

      const farmacia = $(tds[0]).text().trim();
      const direccion = $(tds[1]).text().trim();
      const telefono = $(tds[2]).text().trim();

      if (farmacia) {
        farmacias.push({ farmacia, direccion, telefono });
      }
    });

    const resultado = {
      fecha,
      cantidad: farmacias.length,
      farmacias,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync("data.json", JSON.stringify(resultado, null, 2));

    let historico = {};
    if (fs.existsSync("historico.json")) {
      historico = JSON.parse(fs.readFileSync("historico.json"));
    }

    historico[fecha] = resultado;

    fs.writeFileSync("historico.json", JSON.stringify(historico, null, 2));

    console.log("OK:", resultado.cantidad, "farmacias");
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

scrape();    });

    const resultado = {
      fecha,
      cantidad: farmacias.length,
      farmacias,
      fuente: "turnos.colfarmamdp.com.ar",
      timestamp: new Date().toISOString()
    };

    // guardar HOY
    fs.writeFileSync("data.json", JSON.stringify(resultado, null, 2));

    // ===== HISTORICO =====
    let historico = {};

    if (fs.existsSync("historico.json")) {
      historico = JSON.parse(fs.readFileSync("historico.json"));
    }

    historico[fecha] = resultado;

    fs.writeFileSync("historico.json", JSON.stringify(historico, null, 2));

    console.log("OK:", resultado.cantidad, "farmacias");
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

scrape();
