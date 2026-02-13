import { defineConfig } from "vite";
import { resolve } from "node:path";
import fs from "node:fs";

const pagesDir = resolve(__dirname, "pages");

const inputs = Object.fromEntries(
  fs
    .readdirSync(pagesDir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => [f.replace(/\.html$/, ""), resolve(pagesDir, f)])
);

export default defineConfig({
  root: pagesDir,                 // equivalente a "pages" ma robusto
  publicDir: resolve(__dirname, "assets"),
  build: {
    outDir: resolve(__dirname, "dist"), // dist in root repo (quello che vuole Vercel)
    emptyOutDir: true,
    rollupOptions: {
      input: inputs,              // builda tutti gli .html in /pages
    },
  },
});
