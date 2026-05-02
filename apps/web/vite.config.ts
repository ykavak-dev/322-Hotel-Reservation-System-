import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@hotel/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    open: false,
  },
});
