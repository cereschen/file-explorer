import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue"
import svgSpritePlugin from "vite-plugin-svg-sprite-component"
export default defineConfig({
  plugins: [Vue(), svgSpritePlugin({ symbolId: (name) => "icon-" + name })],
  resolve: {
    alias: {
      "socket.io-client": "socket.io-client/dist/socket.io.js",
      "path": "path-browserify"
    }
  },
  optimizeDeps: { include: ['path-browserify'] }
})