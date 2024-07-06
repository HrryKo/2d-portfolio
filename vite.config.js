// Bundlr will do transpiling and optimization.

import { defineConfig } from "vite";

export default defineConfig({
  base: "./", // base for assets
  build: {
    minify: "terser",
  },
});
