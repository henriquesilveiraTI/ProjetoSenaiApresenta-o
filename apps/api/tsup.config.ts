import { writeFile } from "node:fs/promises";
import { defineConfig } from "tsup";

// O bundle sai em CommonJS porque, na Vercel, o dist/server.js roda sem
// nenhum package.json com "type": "module" ao lado.
export default defineConfig({
  entry: ["src/server.ts"],
  format: ["cjs"],
  outExtension: () => ({ js: ".js" }),
  cjsInterop: true,
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  splitting: false,
  noExternal: ["@error/shared"],
  // Localmente o package.json da API tem "type": "module"; isto faz o Node
  // tratar o dist como CommonJS no `npm start`.
  onSuccess: () =>
    writeFile("dist/package.json", '{ "type": "commonjs" }\n'),
});
