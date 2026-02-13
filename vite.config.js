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
    root: pagesDir,
    // Let Vite handle assets referenced from HTML/CSS/JS.
    publicDir: false,
    build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
        rollupOptions: {
            input: inputs
        }
    }
});
