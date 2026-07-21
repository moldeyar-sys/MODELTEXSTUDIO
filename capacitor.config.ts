import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.modeltex.app',
  appName: 'Modeltex',
  webDir: 'dist',
  // La app carga la web EN VIVO: cada deploy de modeltex.com.ar se ve en la
  // app con solo cerrarla y volverla a abrir, sin recompilar el APK.
  // Arranca directo en /admin (uso principal: gestionar el sitio desde el
  // celular); si no hay sesión, el login redirige de vuelta a /admin solo.
  // Desde ahi se puede navegar al resto del sitio con el menu normal.
  server: {
    url: 'https://modeltex.com.ar/admin',
    androidScheme: 'https'
  },
  android: {
    path: 'apk/android'
  }
};

export default config;
