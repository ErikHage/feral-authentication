import { test } from '../../helpers/ui/ui-test';

test.describe('Authorization admin page', () => {
    test.beforeEach(async ({ loginPage, applicationPickerPage, adminPage, usersAdminPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToUsers();
        await usersAdminPage.addUser('user: bob');
        await usersAdminPage.checkUserIsListed('user: bob');
    });

    test('grants a role to a user', async ({ usersAdminPage, rolesAdminPage, authorizationAdminPage }) => {
        await usersAdminPage.adminNav.goToRoles();
        await rolesAdminPage.addRole('role: tester');
        await rolesAdminPage.checkRoleIsListed('role: tester');
        await rolesAdminPage.adminNav.goToAuthorization();

        await authorizationAdminPage.grantRole('user: bob', 'role: tester');

        await authorizationAdminPage.checkUserHasRole('user: bob', 'role: tester');
    });

    test('grants an application to a user', async ({ usersAdminPage, authorizationAdminPage }) => {
        await usersAdminPage.adminNav.goToAuthorization();

        await authorizationAdminPage.grantApplication('user: bob', 'application: Feral Authentication');

        await authorizationAdminPage.checkUserHasApplication('user: bob', 'application: Feral Authentication');
    });

    test('lets a user granted feral/admin into the admin pages', async ({
        usersAdminPage, authorizationAdminPage, loginPage, applicationPickerPage, adminPage,
    }) => {
        await usersAdminPage.adminNav.goToAuthorization();
        await authorizationAdminPage.grantRole('user: bob', 'role: feral/admin');
        await authorizationAdminPage.appBar.logOut();
        // Afresh: the admin's users list would still be in the store (A31)
        await loginPage.open();

        await loginPage.logIn('user: bob');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToUsers();

        await usersAdminPage.checkUserIsListed('user: bob');
    });

    // DocumentsCurrentBehavior: bob's own list is refused (403, as below), and
    // logging out cleared nothing from the stores, so bob is offered the
    // admin's applications (backlog A31). Should offer none. Relies on the
    // admin account having at least one application.
    test('offers the next user to log in none of the previous user\'s applications', async ({
        usersAdminPage, loginPage, applicationPickerPage,
    }) => {
        await usersAdminPage.appBar.logOut();

        // In the same running app: no reload since the admin logged out
        await loginPage.logIn('user: bob');

        await applicationPickerPage.checkOffersNoApplications();
    });

    test.describe('for a user without the admin role', () => {
        // Each logs out, then loads the app afresh, so nothing is left from
        // the admin's session (see the test above)

        // DocumentsCurrentBehavior: every service endpoint past login, verify,
        // single sign-on and logout needs feral/admin, including the user's own
        // applications (backlog A30). The service refuses (403), and the page
        // shows no applications and no error (A11). Should show the granted one.
        test('offers the applications granted to them', async ({
            usersAdminPage, authorizationAdminPage, loginPage, applicationPickerPage,
        }) => {
            await usersAdminPage.adminNav.goToAuthorization();
            await authorizationAdminPage.grantApplication('user: bob', 'application: Feral Authentication');
            await authorizationAdminPage.appBar.logOut();
            await loginPage.open();

            await loginPage.logIn('user: bob');

            await applicationPickerPage.checkOffersApplication('application: Feral Authentication');
        });

        // DocumentsCurrentBehavior: the service refuses the users list and the
        // user's roles (403, A30). The page shows nothing but its navigation,
        // and no error (A18). Should show bob's details.
        test('shows them their profile', async ({ usersAdminPage, loginPage, applicationPickerPage, profilePage }) => {
            await usersAdminPage.appBar.logOut();
            await loginPage.open();
            await loginPage.logIn('user: bob');
            await applicationPickerPage.checkIsShown();

            await applicationPickerPage.dashboardNav.goToProfile();

            await profilePage.checkShowsUser('user: bob');
        });

        // DocumentsCurrentBehavior: the service refuses the list (403, A30), and
        // the page shows "Request failed with status code 403". Should list the
        // session bob is logged in with.
        test('lists their sessions', async ({ usersAdminPage, loginPage, applicationPickerPage, sessionsPage }) => {
            await usersAdminPage.appBar.logOut();
            await loginPage.open();
            await loginPage.logIn('user: bob');
            await applicationPickerPage.checkIsShown();

            await applicationPickerPage.dashboardNav.goToSessions();

            await sessionsPage.checkListsCurrentSession();
        });
    });
});
