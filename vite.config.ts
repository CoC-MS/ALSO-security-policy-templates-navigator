import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/ALSO-security-policy-templates-navigator/",
  plugins: [react()],
  server: {
    watch: {
      ignored: ["**/.headless-edge-profile/**"],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        notFound: "404.html",
      },
    },
  },
});
