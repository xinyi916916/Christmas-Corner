import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath, URL } from 'node:url';

// Actions supplies owner/repository; local builds use portable relative URLs.
const [owner, repository] = (process.env.GITHUB_REPOSITORY || '').split('/');
const pagesBase = repository
  ? (repository.toLowerCase() === owner.toLowerCase() + '.github.io' ? '/' : '/' + repository + '/')
  : './';
export default defineConfig({
  base: process.env.PAGES_BASE_PATH || pagesBase,
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  css: { postcss: { plugins: [tailwindcss()] } },
  server: { port: 3000 },
  build: { outDir: 'dist', emptyOutDir: true },
});
