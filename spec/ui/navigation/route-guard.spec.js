import { test } from '../../helpers/ui/ui-test';

test.describe('Route guard and logout', () => {
    test('lets a visitor go from the public page to the login page', async ({ publicPage, loginPage }) => {
        await publicPage.open();

        await publicPage.goToLogin();

        await loginPage.checkIsShown();
        await loginPage.appBar.checkOffersNothing();
    });

    test('sends a visitor who is not logged in from an admin page to the login page', async ({
        usersAdminPage, loginPage,
    }) => {
        await usersAdminPage.open();

        await loginPage.checkIsShown();
    });

    test('returns a visitor to the page they asked for once they log in', async ({
        usersAdminPage, loginPage,
    }) => {
        await usersAdminPage.open();
        await loginPage.checkIsShown();

        await loginPage.logIn('user: admin');

        await usersAdminPage.checkIsShown();
    });

    test('logs the admin out', async ({ loginPage, applicationPickerPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();

        await applicationPickerPage.appBar.logOut();

        await loginPage.checkIsShown();
        await loginPage.appBar.checkOffersNothing();
    });

    test('applies again once the admin logs out', async ({ loginPage, applicationPickerPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.logOut();
        await loginPage.checkIsShown();

        // Back to the applications page, within the app: no reload to reset it
        await loginPage.goBack();

        await loginPage.checkIsShownAfterGoingBack();
    });

    test('keeps a logged-in admin on the page they reload', async ({
        loginPage, applicationPickerPage, adminPage, usersAdminPage,
    }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToUsers();
        await usersAdminPage.checkIsShown();

        await usersAdminPage.reload();

        await usersAdminPage.checkIsShownAfterReload();
    });
});
