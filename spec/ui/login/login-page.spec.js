import { test } from '../../helpers/ui/ui-test';

test.describe('Login page', () => {
    test('takes the admin to the applications page', async ({ loginPage, applicationPickerPage }) => {
        await loginPage.open();

        await loginPage.logIn('user: admin');

        await applicationPickerPage.checkIsShown();
    });

    test('rejects a wrong password', async ({ loginPage }) => {
        await loginPage.open();

        await loginPage.logIn('user: admin', 'password: wrong');

        await loginPage.checkLoginIsRejected();
    });
});
