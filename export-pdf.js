const puppeteer = require("puppeteer");
const path = require("path");

const file = process.argv[2];
const output = process.argv[3] || "saida.pdf";

if (!file) {
  console.error("Uso: node export-pdf.js arquivo.html saida.pdf");
  process.exit(1);
}

const run = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(file), {
    waitUntil: "networkidle0",
  });

  // Mede o tamanho real do conteúdo
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    };
  });

  // Converte px -> polegadas (1in = 96px)
  const widthInInches = dimensions.width / 96;
  const heightInInches = dimensions.height / 96;

  await page.pdf({
    path: output,
    printBackground: true,
    width: `${widthInInches}in`,
    height: `${heightInInches}in`,
    pageRanges: "1",
  });

  await browser.close();
  console.log(`PDF gerado (${dimensions.width}x${dimensions.height}px):`, output);
};

run();

