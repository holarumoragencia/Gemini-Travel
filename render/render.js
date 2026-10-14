// Renderiza la escena cuadro por cuadro con Chromium headless y arma el MP4 con ffmpeg.
// Uso: node render.js [--w 1920 --h 1080 --fps 30 --out ../videos/vuelo-rd-1920x1080.mp4]
//      [--scene isologo.html --name isologo --sub 4 --grain]
// --sub N captura N subcuadros por cuadro y los promedia (motion blur real).
// --grain agrega un grano muy suave para que los degradés no se vean en bandas.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const arg = (name, def) => {
  const i = process.argv.indexOf("--" + name);
  return i > -1 ? process.argv[i + 1] : def;
};
const W = +arg("w", 1920), H = +arg("h", 1080), FPS = +arg("fps", 30);
const SCENE = arg("scene", "scene.html"), NAME = arg("name", "vuelo-rd"), SUB = +arg("sub", 1);
const GRAIN = process.argv.includes("--grain");
const OUT = path.resolve(arg("out", path.join(__dirname, "..", "videos", `${NAME}-${W}x${H}.mp4`)));
const FRAMES = path.join(__dirname, ".frames", `${NAME}-${W}x${H}`);

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };

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
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const srv = await serve();
  const exe = ["/opt/pw-browsers/chromium"].find((p) => fs.existsSync(p));
  const browser = await chromium.launch({
    executablePath: exe,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on("pageerror", (e) => console.error("pageerror:", e.message));
  await page.goto(`http://localhost:${srv.address().port}/${SCENE}?w=${W}&h=${H}`);
  await page.evaluate(() => window.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const total = Math.round(duration * FPS * SUB);
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.draw(t), i / (FPS * SUB));
    await page.screenshot({ path: path.join(FRAMES, `f${String(i).padStart(5, "0")}.png`) });
    if (i % (30 * SUB) === 0) process.stdout.write(`cuadro ${i}/${total}\n`);
  }
  await browser.close();
  srv.close();
  const vf = [];
  if (SUB > 1) vf.push(`tmix=frames=${SUB}`, `select='not(mod(n+1\\,${SUB}))'`, `setpts=N/${FPS}/TB`);
  if (GRAIN) vf.push("noise=alls=3:allf=t");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS * SUB),
    "-i", path.join(FRAMES, "f%05d.png"), ...(vf.length ? ["-vf", vf.join(",")] : []),
    "-r", String(FPS), "-c:v", "libx264", "-preset", "slow", "-crf", "18",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], { stdio: "inherit" });
  fs.rmSync(FRAMES, { recursive: true, force: true });
  console.log("Listo:", OUT);
})();
