import { randomBytes } from 'node:crypto';
import { chromium } from '@playwright/test';

import { admin, appUrl, authServiceUrl, envFileHint } from './config';
import { createLoginPageDriver } from '../drivers/login-page-driver';
import { describeBlocked, guardNetwork, wiringHint } from '../support/network-guard';
import { listUsers, login, ping, probeApp } from '../support/service-client';

/**
 * Preflight: checks the service, the admin login and the app once, before
 * any test runs, and turns each way the suite can be misconfigured into a
 * message naming the fix, rather than a wall of identical timeouts.
 *
 * The suite never starts anything; ./start-feral-authentication.sh does.
 */

const startHint = 'Start both with ./start-feral-authentication.sh (the service needs MySQL), '
    + 'or point UI_APP_URL / UI_AUTH_SERVICE_URL at running ones.';

const describe = reply => reply.error || `status ${reply.status}`;

export default async function globalSetup() {
    if (!admin.username || !admin.password) {
        throw new Error(`UI_ADMIN_USERNAME and UI_ADMIN_PASSWORD are not set. ${envFileHint}`);
    }

    const service = await ping();

    if (service.error) {
        throw new Error(`feral-authentication-service is not answering at ${authServiceUrl} `
            + `(${service.error}). ${startHint}`);
    }

    const loggedIn = await login(admin.username, admin.password);

    if (loggedIn.status !== 200 || typeof loggedIn.body?.token !== 'string') {
        throw new Error(`logging in as "${admin.username}" failed (${describe(loggedIn)}). `
            + 'Check UI_ADMIN_USERNAME and UI_ADMIN_PASSWORD in spec/helpers/ui/.env.ui, '
            + 'and UI_APPLICATION_ID if it is set.');
    }

    const users = await listUsers(loggedIn.body.token);

    if (users.status === 403) {
        throw new Error(`"${admin.username}" logged in, but may not list users. The user needs the `
            + 'feral/admin role, and UI_APPLICATION_ID must be the application scoped `feral`, '
            + 'since a session only carries the roles of its application\'s scope.');
    }
    if (users.status !== 200) {
        throw new Error(`listing users as "${admin.username}" failed (${describe(users)}).`);
    }

    const app = await probeApp(appUrl);

    if (app.error || app.status !== 200) {
        throw new Error(`the app is not answering at ${appUrl} (${describe(app)}). ${startHint}`);
    }

    await checkAppCallsTheService();
}

/**
 * The checks above reach the service the suite was told about; the app in
 * the browser calls whichever one it was built with. So log in through the
 * page, as a user who doesn't exist, and check where the request went. The
 * network guard aborts it before it leaves if it's going anywhere else.
 */
async function checkAppCallsTheService() {
    const browser = await chromium.launch();

    try {
        const context = await browser.newContext();
        const guard = await guardNetwork(context);
        const page = await context.newPage();
        const loginPage = createLoginPageDriver(page);
        const loginRequest = page.waitForRequest(
            request => request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/login'),
            { timeout: 15_000 },
        ).catch(() => undefined);

        await loginPage.open();
        await loginPage.logIn(`ui-preflight-${randomBytes(4).toString('hex')}`, randomBytes(12).toString('hex'));
        const request = await loginRequest;

        if (guard.blocked.length > 0) {
            throw new Error(`${describeBlocked(guard.blocked)}${wiringHint}`);
        }
        if (!request) {
            throw new Error(`logging in on ${appUrl}login sent no login request. Is the app at `
                + 'UI_APP_URL feral-authentication?');
        }
        if (request.url() !== `${authServiceUrl.replace(/\/$/, '')}/login`) {
            throw new Error(`the app logs in at ${request.url()}, not at ${authServiceUrl}/login. `
                + wiringHint);
        }
    } finally {
        await browser.close();
    }
}
