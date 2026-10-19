import { test } from '../../helpers/ui/ui-test';

test.describe('Sessions page', () => {
    // As bob, granted feral/admin: a new user's sessions are only the test's
    // own, and only an admin can use the dashboard (backlog A30)
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
        await authorizationAdminPage.grantRole('user: bob', 'role: feral/admin');
        await authorizationAdminPage.appBar.logOut();
        await loginPage.checkIsShown();
        // Afresh, so nothing is left from the admin's session (A31)
        await loginPage.open();
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

    // DocumentsCurrentBehavior: the Scope field is empty. The service lists a
    // session's applicationId, not its scope (backlog A32). Should show feral.
    test('shows the scope of a session', async ({ applicationPickerPage, sessionsPage }) => {
        await applicationPickerPage.dashboardNav.goToSessions();

        await sessionsPage.checkShowsScope();
    });
});
