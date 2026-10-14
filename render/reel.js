// Renderiza el reel vertical de China (1080x1920, 30 fps).
// 1) Arma el fondo con los clips de ../clips (o una foto de muestra si falta alguno).
// 2) Renderiza los gráficos de reel.html con fondo transparente, cuadro por cuadro.
// 3) Los superpone con ffmpeg y suma ../clips/musica.mp3 si existe.
// Uso: node reel.js [--out ../videos/reel-china-1080x1920.mp4] [--preview]   (--preview = 15 fps, más rápido)
const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const arg = (name, def) => {
  const i = process.argv.indexOf("--" + name);
  return i > -1 ? process.argv[i + 1] : def;
};
const W = 1080, H = 1920;
const FPS = process.argv.includes("--preview") ? 15 : 30;
const OUT = path.resolve(arg("out", path.join(__dirname, "..", "videos", "reel-china-1080x1920.mp4")));
const CLIPS = path.join(__dirname, "..", "clips");
const TMP = path.join(__dirname, ".frames", "reel");
const PLACEHOLDER = path.join(__dirname, "assets", "placeholder-muralla.jpg");

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "reel-config.js"), "utf8"), ctx);
const R = ctx.window.REEL;

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2" };
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

function buscarClip(nombre) {
  if (!nombre) return null;
  for (const ext of [".mp4", ".mov", ".m4v", ".webm"]) {
    const f = path.join(CLIPS, nombre + ext);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

// Cada escena: recorte al formato vertical + acercamiento lento (efecto Ken Burns)
function armarFondo() {
  const partes = [];
  const faltan = [];
  R.escenas.forEach((e, i) => {
    const dur = (e.fin - e.inicio).toFixed(3);
    const out = path.join(TMP, `fondo-${i}.mp4`);
    const zoom = `scale=w='2*trunc(${W / 2}*(1+0.08*t/${dur}))':h='2*trunc(${H / 2}*(1+0.08*t/${dur}))':eval=frame,crop=${W}:${H},setsar=1`;
    const cover = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;
    const comun = ["-t", dur, "-r", String(FPS), "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", out];
    const clip = buscarClip(e.clip);
    if (clip) {
      ff(["-ss", String(e.desde || 0), "-i", clip, "-vf", `${cover},fps=${FPS},${zoom}`, ...comun]);
    } else if (e.clip) {
      faltan.push(e.clip);
      ff(["-loop", "1", "-framerate", String(FPS), "-i", PLACEHOLDER, "-vf", `${cover},${zoom}`, ...comun]);
    } else {
      ff(["-f", "lavfi", "-i", `color=c=${R.colores.marino}:s=${W}x${H}:r=${FPS}`, ...comun]);
    }
    partes.push(out);
  });
  const lista = path.join(TMP, "lista.txt");
  fs.writeFileSync(lista, partes.map((p) => `file '${p}'`).join("\n"));
  const fondo = path.join(TMP, "fondo.mp4");
  ff(["-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", fondo]);
  return { fondo, faltan };
}

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const file = path.join(__dirname, decodeURIComponent(new URL(req.url, "http://x").pathname));
      if (!file.startsWith(__dirname) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, () => resolve(srv));
  });
}

(async () => {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(path.join(TMP, "g"), { recursive: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  console.log("Armando fondo con los clips…");
  const { fondo, faltan } = armarFondo();
  if (faltan.length) console.log("Clips faltantes (se usa foto de muestra):", faltan.join(", "));

  const srv = await serve();
  const exe = ["/opt/pw-browsers/chromium"].find((p) => fs.existsSync(p));
  const browser = await chromium.launch({ executablePath: exe });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on("pageerror", (e) => console.error("pageerror:", e.message));
  await page.goto(`http://localhost:${srv.address().port}/reel.html?faltan=${faltan.join(",")}`);
  await page.evaluate(() => window.ready);
  const total = Math.round(R.duracion * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.draw(t), i / FPS);
    await page.screenshot({ path: path.join(TMP, "g", `f${String(i).padStart(5, "0")}.png`), omitBackground: true });
    if (i % 30 === 0) process.stdout.write(`cuadro ${i}/${total}\n`);
  }
  await browser.close();
  srv.close();

  console.log("Componiendo…");
  const musica = ["musica.mp3", "musica.m4a", "musica.wav"].map((m) => path.join(CLIPS, m)).find(fs.existsSync);
  const args = ["-i", fondo, "-framerate", String(FPS), "-i", path.join(TMP, "g", "f%05d.png")];
  if (musica) args.push("-i", musica);
  args.push("-filter_complex", "[0:v][1:v]overlay=0:0:format=auto,format=yuv420p[v]", "-map", "[v]");
  if (musica) args.push("-map", "2:a", "-af", `afade=t=out:st=${R.duracion - 1.2}:d=1.2`, "-c:a", "aac", "-b:a", "192k");
  args.push("-t", String(R.duracion), "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
    "-movflags", "+faststart", OUT);
  ff(args);
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log("Listo:", OUT);
})();
