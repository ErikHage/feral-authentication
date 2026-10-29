import { test } from '../../helpers/ui/ui-test';

test.describe('Profile page', () => {
    // As bob, a user without the admin role, so the admin's own name is never
    // edited
    test.beforeEach(async ({
        loginPage, applicationPickerPage, adminPage, usersAdminPage,
    }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToUsers();
        await usersAdminPage.addUser('user: bob');
        await usersAdminPage.checkUserIsListed('user: bob');
        await usersAdminPage.appBar.logOut();
        await loginPage.checkIsShown();
        await loginPage.logIn('user: bob');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.dashboardNav.goToProfile();
    });

    test('shows the user their details', async ({ profilePage }) => {
        await profilePage.checkShowsUser('user: bob');
    });

    test('saves a new first name', async ({ profilePage }) => {
        await profilePage.changeFirstName('firstName: Robert');
        await profilePage.save();
        await profilePage.checkDetailsAreSaved();

        await profilePage.reload();

        await profilePage.checkShowsUser('user: bob', 'firstName: Robert');
    });

    test('keeps Save disabled while the first name is empty', async ({ profilePage }) => {
        await profilePage.changeFirstName('firstName: Robert');

        await profilePage.clearFirstName();

        await profilePage.checkCannotSave();
    });

    test('keeps the saved name in the heading until Save', async ({ profilePage }) => {
        await profilePage.changeFirstName('firstName: Robert');

        await profilePage.checkHeadingIsUnchanged('user: bob');
    });
});

test.describe('Profile page, after switching users', () => {
    test('shows the next user to log in their own details', async ({
        loginPage, applicationPickerPage, adminPage, usersAdminPage, profilePage,
    }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToUsers();
        await usersAdminPage.addUser('user: bob');
        await usersAdminPage.checkUserIsListed('user: bob');
        await usersAdminPage.appBar.goToDashboard();
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
