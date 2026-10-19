import { expectUrl, expectVisible } from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';
import { openPath, urlOf } from './urls';

// For a URL to match literally inside a RegExp
const escaped = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The login page, as Playwright sees it. */
export function createLoginPageDriver(page) {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');
    const submitButton = page.getByRole('button', { name: 'Submit' });
    // Each Vuetify field's message area is an (empty) alert too, so match the
    // text. The page's alert fades out after 3s, well inside the assertion
    // timeout
    const loginError = page.getByRole('alert').filter({ hasText: 'Error logging in' });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the login page',
            path: 'login',
            marker: main => main.getByRole('button', { name: 'Submit' }),
        }),

        async logIn(username, password) {
            await usernameField.fill(username);
            await passwordField.fill(password);
            await submitButton.click();
        },

        async showsLoginError() {
            const what = 'logging in with the wrong password';

            await expectVisible(loginError, what);
            await expectUrl(page, urlOf('login'), what);
        },

        /**
         * Opens the login page for single sign-on to an application. The
         * application's URL is made up, so the browser is answered with an
         * empty page when it's sent there.
         */
        async openForApplication(applicationId, applicationUrl) {
            await page.route(`${applicationUrl}**`, route => route.fulfill({
                contentType: 'text/html',
                body: '<!doctype html><title>A made-up application</title>',
            }));
            await openPath(page, `login?app=${applicationId}`);
        },

        /** The login page, opened for single sign-on: its URL names the application. */
        async isShownForSignOn() {
            const what = 'showing the login page for single sign-on';

            await expectUrl(page, new RegExp(`^${escaped(urlOf('login'))}\\?app=[0-9a-f-]{36}$`), what);
            await expectVisible(submitButton, what);
        },

        /** The browser was sent to the application, with a single sign-on token. */
        async sentToApplication(applicationUrl) {
            await expectUrl(page, new RegExp(`^${escaped(applicationUrl)}\\?sso=[^&]+$`),
                `signing on to ${applicationUrl}`);
        },

        async goBack() {
            await page.goBack();
        },

        /**
         * Today's behaviour after going Back to the applications page while
         * logged out: the login form shows, under the applications page's URL.
         */
        async isShownUnderTheApplicationsUrl() {
            const what = 'going back to the applications page after logging out';

            await expectVisible(submitButton, what);
            await expectUrl(page, urlOf('dashboard/applications'), what);
        },
    };
}
