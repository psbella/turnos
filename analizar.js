const fs = require("fs");

const data = JSON.parse(fs.readFileSync("historico.json"));

const conteo = {};

for (const fecha in data) {
  const farmacias = data[fecha].farmacias;

  farmacias.forEach(f => {
    if (!conteo[f.farmacia]) {
      conteo[f.farmacia] = 0;
    }
    conteo[f.farmacia]++;
  });
}

const ranking = Object.entries(conteo)
  .sort((a, b) => b[1] - a[1]);

console.log("Top farmacias:");
console.log(ranking.slice(0, 10));
