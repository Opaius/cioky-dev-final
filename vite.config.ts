import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression";

import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import solidPlugin from "vite-plugin-solid";
import { translatedPathnames } from "./utils/pathnames";
import { prerenderRoutes } from "./utils/prerendered";

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      outputStructure: "message-modules",
      cookieName: "PARAGLIDE_LOCALE",
      strategy: ["url", "cookie", "preferredLanguage", "baseLocale"],
      urlPatterns: translatedPathnames,
    }),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        crawlLinks: false,
      },
      sitemap: {
        enabled: true,
        host: process.env.VITE_HOST || "http://localhost:3000",
      },
      pages: prerenderRoutes,
    }),
    solidPlugin({ ssr: true }),

    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240,
      deleteOriginFile: false,
    }),
  ],
});
