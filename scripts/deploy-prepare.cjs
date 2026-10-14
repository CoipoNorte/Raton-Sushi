/**
 * Prepara Raton Sushi para GitHub Pages sin depender del parser de CMD.
 *
 * Uso desde deploy.bat:
 *   node scripts\deploy-prepare.cjs package
 *   node scripts\deploy-prepare.cjs vite
 *
 * El segundo argumento opcional permite probarlo en otra carpeta:
 *   node scripts/deploy-prepare.cjs vite C:\ruta\de\prueba
 */
const fs = require("fs");
const path = require("path");

const action = process.argv[2];
const root = path.resolve(process.argv[3] || process.cwd());
const BASE_PATH = "/Raton-Sushi/";

function fail(message) {
  console.error(`   [ERROR] ${message}`);
  process.exit(1);
}

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) fail(`${file} no existe en ${root}`);
  return fs.readFileSync(absolute, "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content, "utf8");
}

function preparePackage() {
  const file = "package.json";
  let pkg;

  try {
    pkg = JSON.parse(read(file));
  } catch (error) {
    fail(`package.json no es JSON valido: ${error.message}`);
  }

  pkg.name = "raton-sushi";
  pkg.private = true;
  pkg.scripts = pkg.scripts && typeof pkg.scripts === "object" ? pkg.scripts : {};
  pkg.scripts.predeploy = "npm run build";
  pkg.scripts.deploy = "gh-pages -d dist";

  write(file, `${JSON.stringify(pkg, null, 2)}\n`);

  const check = JSON.parse(read(file));
  if (
    check.name !== "raton-sushi" ||
    check.scripts?.predeploy !== "npm run build" ||
    check.scripts?.deploy !== "gh-pages -d dist"
  ) {
    fail("no se pudieron guardar los scripts de despliegue");
  }

  console.log("   package.json preparado y verificado.");
}

function prepareVite() {
  const file = "vite.config.ts";
  let source = read(file);
  const newline = source.includes("\r\n") ? "\r\n" : "\n";

  // Reemplaza una base existente, aunque su valor anterior sea distinto.
  const baseLine = /^(\s*)base\s*:[^\r\n]*(?:\r?\n)?/m;
  if (baseLine.test(source)) {
    source = source.replace(baseLine, `$1base: '${BASE_PATH}',${newline}`);
  } else {
    const defineConfig = /defineConfig\s*\(\s*\{/;
    if (!defineConfig.test(source)) {
      fail("no se encontro defineConfig({ en vite.config.ts");
    }
    source = source.replace(
      defineConfig,
      (match) => `${match}${newline}  base: '${BASE_PATH}',`
    );
  }

  write(file, source);

  const exactBase = /^\s*base\s*:\s*['"]\/Raton-Sushi\/['"]\s*,?\s*$/m;
  if (!exactBase.test(read(file))) {
    fail("vite.config.ts no contiene la base exacta /Raton-Sushi/");
  }

  const publicDir = path.join(root, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const noJekyll = path.join(publicDir, ".nojekyll");
  if (!fs.existsSync(noJekyll)) fs.writeFileSync(noJekyll, "", "utf8");

  console.log(`   vite.config.ts: base '${BASE_PATH}' verificada.`);
  console.log("   public/.nojekyll verificado.");
}

if (action === "package") {
  preparePackage();
} else if (action === "vite") {
  prepareVite();
} else {
  fail("accion invalida; usa package o vite");
}