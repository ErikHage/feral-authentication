import { expectUrl, expectVisible } from './assertions';
import { openPath, urlOf } from './urls';

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
        async open() {
            await openPath(page, 'login');
            await expectVisible(submitButton, 'opening the login page');
        },

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
    };
}
