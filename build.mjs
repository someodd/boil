/* One command, one directory of output. `npm run build` writes dist/.
   The bundle is inlined into index.html so the app is a single request. */
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";

const OUT = "dist";
mkdirSync(OUT, { recursive: true });

const res = await build({
  entryPoints: ["main.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
  write: false,
});

/* inside a <script> the HTML parser still hunts for a closing tag, so any
   literal </script or <!-- in the bundle has to be broken up first */
const js = res.outputFiles[0].text
  .replace(/<\/script/gi, "<\\/script")
  .replace(/<!--/g, "<\\!--");
const shell = readFileSync("shell.html", "utf8");
/* $ has meaning in a replacement string; a function's return value has none */
writeFileSync(`${OUT}/index.html`, shell.replace("%BUNDLE%", () => js));

for (const f of ["sw.js", "manifest.webmanifest"]) copyFileSync(f, `${OUT}/${f}`);

for (const size of [192, 512]) {
  execFileSync("magick", ["-background", "none", "icon.svg", "-resize", `${size}x${size}`, `${OUT}/icon-${size}.png`]);
}

const kb = (p) => (statSync(p).size / 1024).toFixed(1) + " KB";
console.log(`dist/index.html  ${kb(`${OUT}/index.html`)}`);
console.log(`dist/sw.js       ${kb(`${OUT}/sw.js`)}`);
