/* eslint-disable import/no-extraneous-dependencies */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      strategies: 'injectManifest',

      // this file does not NEED to be here
      srcDir: 'public',
      filename: 'push-sw.ts',

      manifest: {
        theme_color: '#000000',
      },

      devOptions: {
        enabled: true,
        // chrome only
        type: 'module',
      },
    }),
  ],
});
