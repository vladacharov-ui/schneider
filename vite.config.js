import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        en: resolve(__dirname, 'en.html'),
        documents: resolve(__dirname, 'documents.html'),
        enDocuments: resolve(__dirname, 'en-documents.html')
      }
    }
  }
});
