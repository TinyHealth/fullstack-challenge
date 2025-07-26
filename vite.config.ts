import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/frontend',
  server: {
    port: 3001,
  },
  build: {
    outDir: '../../dist/frontend',
    emptyOutDir: true,
  },
});
