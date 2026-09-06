import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  resolve: {
    alias: {
      // dev against source — no package build needed while iterating
      "@mut/react": r("../packages/react/src/index.ts"),
      "@mut/styles": r("../packages/styles/src/index.css"),
    },
  },
});
