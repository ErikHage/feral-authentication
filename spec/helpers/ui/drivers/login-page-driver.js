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
    const credentialsWrong = page.getByRole('alert')
        .filter({ hasText: "Couldn't log in: the username or password is wrong" });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the login page',
            path: 'login',
            marker: main => main.getByRole('button', { name: 'Submit' }),
        }),

        /** Perhaps with the guard's note of the page to return to after logging in. */
        async isShown() {
            const what = 'showing the login page';

            await expectUrl(page, new RegExp(`^${escaped(urlOf('login'))}(\\?redirect=[^&]+)?$`), what);
            await expectVisible(submitButton, what);
        },

        async logIn(username, password) {
            await usernameField.fill(username);
            await passwordField.fill(password);
            await submitButton.click();
        },

        async saysTheUsernameOrPasswordIsWrong() {
            const what = 'logging in with the wrong password';

            await expectVisible(credentialsWrong, what);
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

        /** Shown in place of the applications page, to return there after logging in. */
        async isShownToReturnToTheApplicationsPage() {
            const what = 'going back to the applications page after logging out';

            await expectVisible(submitButton, what);
            await expectUrl(page, `${urlOf('login')}?redirect=/dashboard/applications`, what);
        },
    };
}
