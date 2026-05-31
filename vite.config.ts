/** @format */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, Plugin, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import * as fs from "fs";
import { resolve } from "path";

function geistFontsCopyPlugin(): Plugin {
  const root = process.env.PROJECT_ROOT || import.meta.dirname;
  const fontsDir = resolve(root, "public/fonts");

  const filesToCopy = [
    {
      src: resolve(root, "node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2"),
      dest: resolve(fontsDir, "Geist-Variable.woff2"),
    },
    {
      src: resolve(root, "node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2"),
      dest: resolve(fontsDir, "GeistMono-Variable.woff2"),
    },
  ];

  function copyFonts() {
    fs.mkdirSync(fontsDir, { recursive: true });
    for (const { src, dest } of filesToCopy) {
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`[geist-fonts] Copied ${src} → ${dest}`);
      } else {
        console.warn(`[geist-fonts] Source not found, skipping: ${src}`);
      }
    }
  }

  // Copy immediately so `vite dev` works without waiting for buildStart
  copyFonts();

  return {
    name: "geist-fonts-copy",
    buildStart() {
      copyFonts();
    },
  };
}

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
    geistFontsCopyPlugin(),
  ],
  resolve: {
    alias: {
      "@": resolve(projectRoot, "src"),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
