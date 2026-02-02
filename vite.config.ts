import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "src/core"),
      "@renderer": path.resolve(__dirname, "src/renderer"),
      "@ui": path.resolve(__dirname, "src/ui")
    }
  }
});
