import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      // El placeholder %VITE_GSC_VERIFICATION% de index.html solo se reemplaza
      // por Vite cuando la variable existe; sin configurar, hay que sacar la
      // línea a mano para no dejar el texto crudo "%VITE_GSC_VERIFICATION%"
      // en el HTML de producción (inofensivo, pero no es prolijo).
      {
        name: 'strip-unconfigured-gsc-meta',
        transformIndexHtml(html: string) {
          if (env.VITE_GSC_VERIFICATION) return html;
          return html.replace(/\s*<meta name="google-site-verification"[^>]*>\n?/, '\n');
        },
      },
    ],
    server: {
      port: process.env.PORT ? Number(process.env.PORT) : 5173,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      rollupOptions: {
        output: {
          // Función en vez de objeto: un objeto de manualChunks solo agrupa
          // por nombre de paquete exacto, y lucide-react se importa como
          // decenas de archivos internos separados (un ícono = un módulo).
          // Sin esto, Rollup terminaba con ~37 chunks de menos de 2 KB cada
          // uno (un ícono por chunk) repartidos entre las páginas que lo usan
          // en vez de un único vendor de íconos cacheado una sola vez.
          manualChunks(id: string) {
            if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/react-router/')
            ) return 'vendor-react';
            if (id.includes('node_modules/@supabase/supabase-js')) return 'vendor-supabase';
          },
        },
      },
    },
  };
});
