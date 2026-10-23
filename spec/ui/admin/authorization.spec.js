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

    test("cancels one card's changes and keeps the other's", async ({ usersAdminPage, authorizationAdminPage }) => {
        await usersAdminPage.adminNav.goToAuthorization();
        await authorizationAdminPage.chooseUser('user: bob');
        await authorizationAdminPage.addApplication('application: Feral Authentication');
        await authorizationAdminPage.addRole('role: feral/admin');

        await authorizationAdminPage.cancelRoles();

        await authorizationAdminPage.checkRoleIsNotAdded('role: feral/admin');
        await authorizationAdminPage.checkApplicationIsStillAdded('application: Feral Authentication');
    });

    test("saves one card's changes, keeping the user and the other card's", async ({
        usersAdminPage, authorizationAdminPage,
    }) => {
        await usersAdminPage.adminNav.goToAuthorization();
        await authorizationAdminPage.chooseUser('user: bob');
        await authorizationAdminPage.addApplication('application: Feral Authentication');
        await authorizationAdminPage.addRole('role: feral/admin');

        await authorizationAdminPage.saveRoles();

        await authorizationAdminPage.checkRoleIsSaved('role: feral/admin');
        await authorizationAdminPage.checkApplicationIsStillAdded('application: Feral Authentication');
    });

    test('lets a user granted feral/admin into the admin pages', async ({
        usersAdminPage, authorizationAdminPage, loginPage, applicationPickerPage, adminPage,
    }) => {
        await usersAdminPage.adminNav.goToAuthorization();
        await authorizationAdminPage.grantRole('user: bob', 'role: feral/admin');
        await authorizationAdminPage.appBar.logOut();
        await loginPage.checkIsShown();

        await loginPage.logIn('user: bob');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToUsers();

        await usersAdminPage.checkUserIsListed('user: bob');
    });

    // bob's own list is refused (403, as below). Relies on the admin account
    // having at least one application, so there is something to leave behind
    test('offers the next user to log in none of the previous user\'s applications', async ({
        usersAdminPage, loginPage, applicationPickerPage,
    }) => {
        await usersAdminPage.appBar.logOut();
        await loginPage.checkIsShown();

        // In the same running app: no reload since the admin logged out
        await loginPage.logIn('user: bob');

        await applicationPickerPage.checkOffersNoApplications();
    });

    test.describe('for a user without the admin role', () => {
        // DocumentsCurrentBehavior: every service endpoint past login, verify,
        // single sign-on and logout needs feral/admin, including the user's own
        // applications (backlog A30). The service refuses (403), and the page
        // shows no applications, and says bob doesn't have permission. Should
        // show the granted one.
        test('offers the applications granted to them', async ({
            usersAdminPage, authorizationAdminPage, loginPage, applicationPickerPage,
        }) => {
            await usersAdminPage.adminNav.goToAuthorization();
            await authorizationAdminPage.grantApplication('user: bob', 'application: Feral Authentication');
            await authorizationAdminPage.appBar.logOut();
            await loginPage.checkIsShown();

            await loginPage.logIn('user: bob');

            await applicationPickerPage.checkOffersApplication('application: Feral Authentication');
        });

        // DocumentsCurrentBehavior: the service refuses the users list and the
        // user's own details (403, A30). The page shows nothing but its
        // navigation and an alert saying bob doesn't have permission. Should
        // show bob's details.
        test('shows them their profile', async ({ usersAdminPage, loginPage, applicationPickerPage, profilePage }) => {
            await usersAdminPage.appBar.logOut();
            await loginPage.checkIsShown();
            await loginPage.logIn('user: bob');
            await applicationPickerPage.checkIsShown();

            await applicationPickerPage.dashboardNav.goToProfile();

            await profilePage.checkShowsUserWithoutAdminRole('user: bob');
        });

        // DocumentsCurrentBehavior: the service refuses the list (403, A30), and
        // the page says bob doesn't have permission. Should list the session
        // bob is logged in with.
        test('lists their sessions', async ({ usersAdminPage, loginPage, applicationPickerPage, sessionsPage }) => {
            await usersAdminPage.appBar.logOut();
            await loginPage.checkIsShown();
            await loginPage.logIn('user: bob');
            await applicationPickerPage.checkIsShown();

            await applicationPickerPage.dashboardNav.goToSessions();

            await sessionsPage.checkListsCurrentSession();
        });
    });
});
