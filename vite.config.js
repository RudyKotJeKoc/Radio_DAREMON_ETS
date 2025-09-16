import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['gsap']
        }
      }
    }
  },
  server: {
    port: 8000,
    host: true,
    cors: true
  },
  preview: {
    port: 8000,
    host: true
  },
  optimizeDeps: {
    include: ['gsap']
  }
});