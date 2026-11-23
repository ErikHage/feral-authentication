import { test } from '../../helpers/ui/ui-test';

test.describe('Navigation', () => {
    test.beforeEach(async ({ loginPage, applicationPickerPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
    });

    test('opens the admin area and the dashboard at their first pages', async ({
        applicationPickerPage, rolesAdminPage,
    }) => {
        await rolesAdminPage.openArea();
        await rolesAdminPage.checkIsShown();

        await applicationPickerPage.openArea();
        await applicationPickerPage.checkIsShown();
    });

    test('shows that an unknown URL has no page, with a way home', async ({ notFoundPage, publicPage }) => {
        await notFoundPage.open();
        await notFoundPage.checkIsShown();

        await notFoundPage.goHome();

        await publicPage.checkIsShown();
    });

    test('the User group reaches each of its pages', async ({
        applicationPickerPage, profilePage, sessionsPage,
    }) => {
        await applicationPickerPage.nav.goToProfile();
        await profilePage.checkIsShown();

        await profilePage.nav.goToSessions();
        await sessionsPage.checkIsShown();

        await sessionsPage.nav.goToMyApplications();
        await applicationPickerPage.checkIsShown();
    });

    test('the Admin group reaches each of its pages', async ({
        applicationPickerPage, rolesAdminPage, usersAdminPage,
        authorizationAdminPage, keysAdminPage, applicationsAdminPage,
    }) => {
        await applicationPickerPage.nav.goToRoles();
        await rolesAdminPage.checkIsShown();

        await rolesAdminPage.nav.goToUsers();
        await usersAdminPage.checkIsShown();

        await usersAdminPage.nav.goToAuthorization();
        await authorizationAdminPage.checkIsShown();

        await authorizationAdminPage.nav.goToKeys();
        await keysAdminPage.checkIsShown();

        await keysAdminPage.nav.goToApplications();
        await applicationsAdminPage.checkIsShown();
    });

    test('collapses to a rail that is remembered, and expands again', async ({
        applicationPickerPage, keysAdminPage,
    }) => {
        await applicationPickerPage.nav.collapseToRail();

        await applicationPickerPage.nav.goToKeys();
        await keysAdminPage.checkIsShown();
        await keysAdminPage.nav.checkIsRail();

        await keysAdminPage.reload();
        await keysAdminPage.checkIsShownAfterReload();
        await keysAdminPage.nav.checkIsRail();

        await keysAdminPage.nav.expand();
        await keysAdminPage.reload();
        await keysAdminPage.checkIsShownAfterReload();
        await keysAdminPage.nav.checkIsExpanded();
    });
});
