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
    // Serve and copy /assets into /dist for static JS/CSS/images.
    publicDir: resolve(__dirname, "assets"),
    build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
        rollupOptions: {
            input: inputs
        }
    }
});
