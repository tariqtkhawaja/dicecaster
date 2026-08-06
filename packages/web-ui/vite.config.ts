import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@dicecaster/react': path.resolve(__dirname, '../react/src/index.ts'),
      '@dicecaster/core': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
  server: {
    port: 3000,
  },
});
