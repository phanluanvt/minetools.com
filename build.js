const fs = require("fs");
const path = require("path");
const out = path.join(__dirname, "dist");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const file of ["index.html", "robots.txt"]) {
  fs.copyFileSync(path.join(__dirname, file), path.join(out, file));
}
console.log("MineTools static site built to dist/");
