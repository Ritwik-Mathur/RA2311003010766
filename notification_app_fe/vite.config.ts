import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@logger': path.resolve(__dirname, '../logging_middleware/logger.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
    proxy: {
      '/api': {
        target: 'http://20.207.122.201',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/evaluation-service'),
      },
    },
  },
});
