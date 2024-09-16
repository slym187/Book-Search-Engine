import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Output directory for build files
  },
  server: {
    port: 3000, // The development server will run on port 3000
    open: true, // Automatically open the browser on server start
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Proxy API requests to the backend server
        secure: false,
        changeOrigin: true,
      },
    },
  },
});

