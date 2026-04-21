const axios = require("axios");
const fs = require("fs");

async function scrape() {
  try {
    const { data } = await axios.get("https://www.0223.com.ar/s/turnf");

    // Filtrar solo farmacias (ignorar "ident")
    const farmacias = data
      .filter(item => item.name)
      .map(f => ({
        farmacia: f.name,
        direccion: f.address,
        telefono: f.phone
      }));

    const fecha = `${data[0].dia}/${data[0].mes}/2026`;

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

scrape();        farmacias.push({ farmacia, direccion, telefono });
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
