import { defineConfig } from "vite";

export default defineConfig({
    root: "pages",
    publicDir: "../assets",
    build: {
        outDir: "../dist",
        emptyOutDir: true
    }
});
