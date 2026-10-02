// Builds a static copy of the site into ./dist for GitHub Pages.
// 1. Starts the WebJs server and saves its server-rendered HTML.
// 2. Bundles the browser code (component + WebJs core + Leaflet) with esbuild.
// 3. Rewrites the HTML so every URL is relative (works under /<repo-name>/).
import { spawn } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const PORT = process.env.PORT || "4173";
const OUT = "dist";

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// --- 1. Render the page with the real server -------------------------------
const server = spawn("npx", ["webjs", "start"], {
  env: { ...process.env, PORT },
  stdio: "inherit",
});

let html = "";
try {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/`);
      if (res.ok) {
        html = await res.text();
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!html) throw new Error("Could not fetch / from the WebJs server");
} finally {
  server.kill();
}

// --- 2. Bundle browser code -------------------------------------------------
await build({
  entryPoints: ["components/store-map.ts"],
  bundle: true,
  format: "esm",
  minify: true,
  target: "es2022",
  outfile: `${OUT}/app.js`,
  alias: {
    "@webjsdev/core": "./node_modules/@webjsdev/core/dist/webjs-core-browser.js",
  },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});

// --- 3. Make the HTML static and relative -----------------------------------
html = html
  // import map + module preloads point at server-only URLs
  .replace(/<script type="importmap"[\s\S]*?<\/script>\s*/g, "")
  .replace(/<link rel="modulepreload"[^>]*>\s*/g, "")
  // the inline script that imports the component from the server
  .replace(
    /<script type="module">\s*import "\/components\/store-map\.ts[^"]*";\s*<\/script>/,
    '<script type="module" src="./app.js"></script>',
  )
  // stylesheet
  .replace(/href="\/public\/app\.css[^"]*"/, 'href="./app.css"')
  // drop the live-reload / client-router leftovers if any reference the server
  .replace(/<script[^>]*src="\/__webjs[^"]*"[^>]*><\/script>\s*/g, "");

await writeFile(`${OUT}/index.html`, html);
await cp("public", OUT, { recursive: true });
await writeFile(`${OUT}/.nojekyll`, "");
await writeFile(`${OUT}/404.html`, html);

const leftovers = html.match(/(?:src|href)="\/(?!\/)[^"]*"/g);
if (leftovers) {
  console.warn("WARNING: absolute URLs remain in index.html:", leftovers);
}
console.log("Static site written to ./dist");
