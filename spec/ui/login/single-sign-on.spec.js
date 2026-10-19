import { test } from '../../helpers/ui/ui-test';

// The application is made up, and stays in the database: applications can't
// be deleted. Its URL is answered by the driver, not a real site

test.describe('Single sign-on', () => {
    test.beforeEach(async ({
        loginPage, applicationPickerPage, adminPage, keysAdminPage, applicationsAdminPage,
    }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToKeys();
        await keysAdminPage.generateKey('key: signing');
        await keysAdminPage.checkKeyIsListed('key: signing');
        await keysAdminPage.adminNav.goToApplications();
        await applicationsAdminPage.addApplication('application: game', 'key: signing');
        await applicationsAdminPage.checkApplicationIsListed('application: game');
    });

    test('sends a logged-in user straight on to the application', async ({ loginPage }) => {
        await loginPage.openForApplication('application: game');

        await loginPage.checkSentToApplication('application: game');
    });

    test('sends a user on to the application once they log in', async ({ applicationsAdminPage, loginPage }) => {
        await applicationsAdminPage.appBar.logOut();
        await loginPage.checkIsShown();
        await loginPage.openForApplication('application: game');
        await loginPage.checkIsShownForSignOn();

        await loginPage.logIn('user: admin');

        await loginPage.checkSentToApplication('application: game');
    });
});
