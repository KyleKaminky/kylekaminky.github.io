import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base '/' because the site is served from the root of a GitHub Pages
// organisation site (figuring-things-out.github.io), not a project subpath.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: true },
});
