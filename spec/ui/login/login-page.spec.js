import { test } from '../../helpers/ui/ui-test';

test.describe('Login page', () => {
    test('takes the admin to the applications page', async ({ loginPage, applicationPickerPage }) => {
        await loginPage.open();

        await loginPage.logIn('user: admin');

        await applicationPickerPage.checkIsShown();
    });

    // DocumentsCurrentBehavior: the service answers 500 for a wrong password
    // (backlog A33), so the page says the service failed. Should say the
    // username or password is wrong.
    test('rejects a wrong password', async ({ loginPage }) => {
        await loginPage.open();

        await loginPage.logIn('user: admin', 'password: wrong');

        await loginPage.checkLoginIsRejected();
    });
});
