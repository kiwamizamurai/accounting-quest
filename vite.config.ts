import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ command }) => ({
  // Only use base path for production build (GitHub Pages)
  base: command === 'build' ? '/accounting-game/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
}));
