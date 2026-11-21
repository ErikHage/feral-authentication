import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
    }),
  ],
  server: {
    watch: {
      // Playwright writes these while the UI tests run against this dev
      // server. Watching them makes Vite reload the pages under test
      ignored: ['**/test-results/**', '**/playwright-report/**'],
    },
  },
  // Pre-bundle every Vuetify overlay together. Otherwise the dev server can
  // serve two copies of Vuetify's overlay stack, and a select's menu opens
  // behind the dialog it's in. Builds aren't affected
  optimizeDeps: {
    include: [
      'vuetify/components/VOverlay',
      'vuetify/components/VDialog',
      'vuetify/components/VMenu',
      'vuetify/components/VSelect',
      'vuetify/components/VAutocomplete',
    ],
  },
  define: { 'process.env': {} },
  base: '/auth/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  /* remove the need to specify .vue files https://vitejs.dev/config/#resolve-extensions
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ]
  },
  */
});
