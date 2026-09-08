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
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
  };
});
