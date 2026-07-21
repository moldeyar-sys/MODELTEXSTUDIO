import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.modeltex.app',
  appName: 'Modeltex',
  webDir: 'dist',
  // La app carga la web EN VIVO: cada deploy de modeltex.com.ar se ve en la
  // app con solo cerrarla y volverla a abrir, sin recompilar el APK.
  server: {
    url: 'https://modeltex.com.ar',
    androidScheme: 'https'
  },
  android: {
    path: 'apk/android'
  }
};

export default config;
