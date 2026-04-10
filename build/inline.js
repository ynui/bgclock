const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "../src/index.html");
const cssPath = path.join(__dirname, "../src/styles/main.css");
const jsFiles = ["clock.js", "game.js", "ui.js"];
const outPath = path.join(__dirname, "../dist/index.html");

let html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");

let js = "";
for (const file of jsFiles) {
  let content = fs.readFileSync(path.join(__dirname, "../src", file), "utf8");
  content = content.replace(/^import\s+.*$/gm, "");
  js += content + "\n";
}

html = html.replace("</head>", `  <style>\n${css}\n  </style>\n</head>`);
html = html.replace("</body>", `<script>\n${js}\n</script>\n</body>`);

fs.writeFileSync(outPath, html);
console.log("Built dist/index.html");
