import { defineConfig, devices } from '@playwright/test';

import { appUrl } from './spec/helpers/ui/setup/config';

// UI tests run against an already running app and feral-authentication-service;
// see spec/ui/README.md. There is no webServer: the suite never starts either.
export default defineConfig({
    testDir: './spec/ui',
    globalSetup: './spec/helpers/ui/setup/global-setup.js',
    // One at a time while the suite grows: the tests share one database, and
    // the Vite dev server serves each page as hundreds of unbundled modules.
    // More workers measured faster on the login tests alone (20 runs: 1
    // worker 19s, 4 6.4s, all passing); --workers=N overrides this
    workers: 1,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: appUrl,
        // Without one, a click on a missing element waits out the whole test
        // timeout and reports only that
        actionTimeout: 10_000,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
