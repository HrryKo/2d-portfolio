// Bundlr will do transpiling and optimization.

import { defineConfig } from "vite";

export default defineConfig({
  base: "/2d-portfolio/", // base for assets
  build: {
    minify: "terser",
  },
});
