import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port: 9515
  }
});
