import { test } from '../../helpers/ui/ui-test';

test.describe('Navigation', () => {
    test.beforeEach(async ({ loginPage, applicationPickerPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
    });

    test('the app bar reaches the admin area and the dashboard, at their first pages', async ({
        applicationPickerPage, rolesAdminPage,
    }) => {
        await applicationPickerPage.appBar.goToAdmin();
        await rolesAdminPage.checkIsShown();

        await rolesAdminPage.appBar.goToDashboard();
        await applicationPickerPage.checkIsShown();
    });

    test('shows that an unknown URL has no page, with a way home', async ({ notFoundPage, publicPage }) => {
        await notFoundPage.open();
        await notFoundPage.checkIsShown();

        await notFoundPage.goHome();

        await publicPage.checkIsShown();
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
