const axios = require("axios");
const cheerio = require("cheerio");

async function obtenerFarmacias(fecha) {
  const url = `https://turnos.colfmarmamdp.com/ajax/buscaturno2.php?fecha=${fecha}`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const html = response.data;
  const $ = cheerio.load(html);

  const farmacias = [];

  $("tr").each((i, el) => {
    const cols = $(el).find("td");

    const farmacia = $(cols[0]).text().trim();
    const direccion = $(cols[1]).text().trim();
    const telefono = $(cols[2]).text().trim();

    if (farmacia) {
      farmacias.push({ farmacia, direccion, telefono });
    }
  });

  console.log(farmacias);
}

obtenerFarmacias("2026-04-21");
