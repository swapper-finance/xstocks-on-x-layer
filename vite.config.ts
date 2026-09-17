import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr()],
  server: {
    /* 3001 is the landing page's port — the demo sits next to it in dev */
    port: process.env.PORT ? Number(process.env.PORT) : 3002,
  },
});
