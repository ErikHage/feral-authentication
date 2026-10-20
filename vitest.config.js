import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// One timezone for every run, so date handling is tested the same way on
// any machine. Set here because the test workers can't change it themselves
process.env.TZ = 'America/New_York'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['spec/unit/**/*.spec.js'],
    setupFiles: ['spec/setup.js'],
    // Runs each file in its own VM context, built once per worker. Needed on
    // a Node with Web Storage on by default (26 here): its own localStorage
    // global, undefined without --localstorage-file, otherwise hides
    // jsdom's
    pool: 'vmThreads',
    server: {
      deps: {
        // Vuetify imports its own CSS, which must go through Vite
        inline: ['vuetify'],
      },
    },
    env: {
      VITE_AUTH_SERVICE_V0_BASE_URL: 'https://api.test/feral-authentication-service/v0',
      VITE_APPLICATION_ID: 'test-application-id',
      VITE_ASSET_BASE_PATH: '/assets-test',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**'],
    },
  },
}))
