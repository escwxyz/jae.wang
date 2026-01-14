import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import typegpuPlugin from "unplugin-typegpu/vite";
import { defineConfig } from "vite";
// import glsl from "vite-plugin-glsl";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      router: {},
    }),
    viteReact(),
    // contentCollections()
    typegpuPlugin({}),
    // glsl(),
  ],
  ssr: {
    noExternal: ["@convex-dev/better-auth"],
  },
});

export default config;
