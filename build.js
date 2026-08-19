const esbuild = require("esbuild");
const isWatch = process.argv.includes("--watch");

const config = {
  entryPoints: ["src-bundle/ui5-entry.js"],
  bundle: true,
  format: "esm",
  outfile: "assets/ui5-bundle.js",
  minify: !isWatch,
  sourcemap: isWatch ? "inline" : false,
  target: ["es2020"],
  logLevel: "info",
};

if (isWatch) {
  esbuild.context(config).then(ctx => ctx.watch());
} else {
  esbuild.build(config).then(() => console.log("UI5 bundle built → assets/ui5-bundle.js"));
}
