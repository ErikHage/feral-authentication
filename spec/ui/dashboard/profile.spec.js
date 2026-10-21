import { test } from '../../helpers/ui/ui-test';

test.describe('Profile page', () => {
    // As bob, granted feral/admin, so the admin's own name is never edited.
    // Only an admin can use the dashboard (backlog A30)
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
        await applicationPickerPage.dashboardNav.goToProfile();
    });

    test('shows the user their details', async ({ profilePage }) => {
        await profilePage.checkShowsUser('user: bob');
    });

    test('saves a new first name', async ({ profilePage, applicationPickerPage }) => {
        await profilePage.changeFirstName('firstName: Robert');
        await profilePage.save();
        await profilePage.checkDetailsAreSaved();

        // A reload always lands on the applications page (A4)
        await profilePage.reload();
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.dashboardNav.goToProfile();

        await profilePage.checkShowsUser('user: bob', 'firstName: Robert');
    });

    // The unit suite pins Save as staying enabled here (backlog A9). In a
    // browser it doesn't: Vuetify has validated by the time the page checks
    test('keeps Save disabled while the first name is empty', async ({ profilePage }) => {
        await profilePage.changeFirstName('firstName: Robert');

        await profilePage.clearFirstName();

        await profilePage.checkCannotSave();
    });

    // DocumentsCurrentBehavior: the form edits the stored user itself, so the
    // heading follows the First Name field as it's typed, before saving
    // (backlog A10). Should keep the saved name until Save.
    test('keeps the saved name in the heading until Save', async ({ profilePage }) => {
        await profilePage.changeFirstName('firstName: Robert');

        await profilePage.checkHeadingIsUnchanged('user: bob');
    });
});

test.describe('Profile page, after switching users', () => {
    // DocumentsCurrentBehavior: the store's actor is read once per page load
    // (backlog A2), so after the admin logs out and bob logs in, without a
    // reload, the profile still shows the admin. Should show bob.
    test('shows the next user to log in their own details', async ({
        loginPage, applicationPickerPage, adminPage, usersAdminPage, authorizationAdminPage, profilePage,
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
        await authorizationAdminPage.appBar.goToDashboard();
        await applicationPickerPage.dashboardNav.goToProfile();
        await profilePage.checkIsShown();
        await profilePage.appBar.logOut();
        await loginPage.checkIsShown();

        // In the same running app: no reload since the admin logged out
        await loginPage.logIn('user: bob');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.dashboardNav.goToProfile();

        await profilePage.checkShowsNextUser('user: bob', 'previous: admin');
    });
});
