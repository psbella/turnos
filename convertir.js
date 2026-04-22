const fs = require("fs");

const texto = fs.readFileSync("input.txt", "utf-8");

// separar por fechas tipo 22/04
const bloques = texto.split(/\n(?=\d{1,2}\/\d{1,2})/);

const resultado = [];

bloques.forEach((bloque, index) => {
  const lineas = bloque
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  if (lineas.length < 3) return;

  const farmacias = [];

  // arrancar después de fecha + encabezado
  let i = 2;

  while (i < lineas.length) {
    const nombre = lineas[i];
    const direccion = lineas[i + 1];
    const telefono = lineas[i + 2];

    // validar que parezca teléfono
    if (!telefono || !/\d{6,}/.test(telefono)) {
      i++;
      continue;
    }

    farmacias.push({
      farmacia: nombre,
      direccion,
      telefono
    });

    i += 3;
  }

  resultado.push({
    ciclo: index + 1,
    farmacias
  });
});

fs.writeFileSync("data.json", JSON.stringify(resultado, null, 2));

console.log("✔ Ciclos detectados:", resultado.length);