import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});
