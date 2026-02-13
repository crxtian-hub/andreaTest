import { defineConfig } from "vite";
import { resolve } from "node:path";
import fs from "node:fs";

const pagesDir = resolve(__dirname, "pages");

// prende tutti i .html dentro /pages e crea gli input
const inputs = Object.fromEntries(
    fs
    .readdirSync(pagesDir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => [f.replace(/\.html$/, ""), resolve(pagesDir, f)])
);

export default defineConfig({
    build: {
        rollupOptions: {
            input: inputs,
        },
    },
});
