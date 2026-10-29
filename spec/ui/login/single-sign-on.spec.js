import { test } from '../../helpers/ui/ui-test';

// The application is made up, and stays in the database: applications can't
// be deleted. Its URL is answered by the driver, not a real site.
//
// Signing on to an application needs a grant to it, so bob is granted the
// application and signs on, rather than the admin, whose grants would pile up
// with every run.

test.describe('Single sign-on', () => {
    test.beforeEach(async ({
        loginPage, applicationPickerPage, adminPage, keysAdminPage, applicationsAdminPage, usersAdminPage,
        authorizationAdminPage,
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
        await applicationsAdminPage.adminNav.goToUsers();
        await usersAdminPage.addUser('user: bob');
        await usersAdminPage.checkUserIsListed('user: bob');
        await usersAdminPage.adminNav.goToAuthorization();
        await authorizationAdminPage.grantApplication('user: bob', 'application: game');
        await authorizationAdminPage.checkUserHasApplication('user: bob', 'application: game');
        await authorizationAdminPage.appBar.logOut();
        await loginPage.checkIsShown();
    });

    test('sends a logged-in user straight on to the application', async ({ loginPage, applicationPickerPage }) => {
        await loginPage.logIn('user: bob');
        await applicationPickerPage.checkIsShown();

        await loginPage.openForApplication('application: game');

        await loginPage.checkSentToApplication('application: game');
    });

    test('sends a user on to the application once they log in', async ({ loginPage }) => {
        await loginPage.openForApplication('application: game');
        await loginPage.checkIsShownForSignOn();

        await loginPage.logIn('user: bob');

        await loginPage.checkSentToApplication('application: game');
    });
});
