import { defineConfig } from 'vite';

// User site: repo "s0ul3r.github.io" → https://s0ul3r.github.io
const base = '/';

export default defineConfig({
  base,
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
