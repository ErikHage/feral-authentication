import { test } from '../../helpers/ui/ui-test';

test.describe('Navigation', () => {
    test.beforeEach(async ({ loginPage, applicationPickerPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
    });

    test('the app bar reaches the admin area and the dashboard', async ({
        applicationPickerPage, adminPage, dashboardPage,
    }) => {
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.checkIsShown();

        await adminPage.appBar.goToDashboard();
        await dashboardPage.checkIsShown();
    });

    test('the dashboard navigation reaches each dashboard page', async ({
        applicationPickerPage, profilePage, sessionsPage,
    }) => {
        await applicationPickerPage.dashboardNav.goToProfile();
        await profilePage.checkIsShown();

        await profilePage.dashboardNav.goToSessions();
        await sessionsPage.checkIsShown();

        await sessionsPage.dashboardNav.goToApplications();
        await applicationPickerPage.checkIsShown();
    });

    test('the admin navigation reaches each admin page', async ({
        applicationPickerPage, adminPage, rolesAdminPage, usersAdminPage,
        authorizationAdminPage, keysAdminPage, applicationsAdminPage,
    }) => {
        await applicationPickerPage.appBar.goToAdmin();

        await adminPage.adminNav.goToRoles();
        await rolesAdminPage.checkIsShown();

        await rolesAdminPage.adminNav.goToUsers();
        await usersAdminPage.checkIsShown();

        await usersAdminPage.adminNav.goToAuthorization();
        await authorizationAdminPage.checkIsShown();

        await authorizationAdminPage.adminNav.goToKeys();
        await keysAdminPage.checkIsShown();

        await keysAdminPage.adminNav.goToApplications();
        await applicationsAdminPage.checkIsShown();
    });
});
