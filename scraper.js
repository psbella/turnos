const puppeteer = require("puppeteer");
const fs = require("fs");

function hoy() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

async function run() {
  const fecha = hoy();

  const url = `https://turnos.colfmarmamdp.com/ajax/buscaturno2.php?fecha=${fecha}`;

  console.log("Iniciando browser...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  );

  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 60000
  });

  const content = await page.content();

  console.log("HTML SIZE:", content.length);

  // DEBUG
  fs.writeFileSync("debug_raw.html", content);

  // extracción simple del texto visible
  const text = await page.evaluate(() => document.body.innerText);

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const farmacias = [];
  let actual = null;

  for (const line of lines) {
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

    if (!actual.direccion && line.length > 5) {
      actual.direccion = line;
      continue;
    }

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

  let historico = {};
  if (fs.existsSync("historico.json")) {
    historico = JSON.parse(fs.readFileSync("historico.json"));
  }

  historico[fecha] = farmacias;

  fs.writeFileSync("historico.json", JSON.stringify(historico, null, 2));

  console.log("✔ FARMACIAS:", farmacias.length);

  await browser.close();
}

run();
