import { test } from '../../helpers/ui/ui-test';

test.describe('Sessions page', () => {
    // As bob, a user without the admin role: a new user's sessions are only the
    // test's own. Granted this application, so the page can name it on bob's
    // sessions
    test.beforeEach(async ({
        loginPage, applicationPickerPage, adminPage, usersAdminPage, authorizationAdminPage,
    }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToUsers();
        await usersAdminPage.addUser('user: bob');
        await usersAdminPage.checkUserIsListed('user: bob');
        await usersAdminPage.adminNav.goToAuthorization();
        await authorizationAdminPage.grantApplication('user: bob', 'application: Feral Authentication');
        await authorizationAdminPage.appBar.logOut();
        await loginPage.checkIsShown();
        await loginPage.logIn('user: bob');
        await applicationPickerPage.checkIsShown();
    });

    test('marks the current session, which cannot be revoked', async ({ applicationPickerPage, sessionsPage }) => {
        await applicationPickerPage.dashboardNav.goToSessions();

        await sessionsPage.checkMarksCurrentSession();
    });

    test('revokes a session from another device', async ({ applicationPickerPage, sessionsPage, anotherDevice }) => {
        await anotherDevice.loginPage.open();
        await anotherDevice.loginPage.logIn('user: bob');
        await anotherDevice.applicationPickerPage.checkIsShown();
        await applicationPickerPage.dashboardNav.goToSessions();
        await sessionsPage.checkMarksCurrentSession();

        await sessionsPage.revokeRemoteSession();

        await sessionsPage.checkRemoteSessionIsRevoked();
        await sessionsPage.checkMarksCurrentSession();
    });

    test('names the application of a session', async ({ applicationPickerPage, sessionsPage }) => {
        await applicationPickerPage.dashboardNav.goToSessions();

        await sessionsPage.checkShowsApplication('application: Feral Authentication');
    });
});
