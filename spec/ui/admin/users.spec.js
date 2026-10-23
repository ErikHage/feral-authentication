import { test } from '../../helpers/ui/ui-test';

test.describe('Users admin page', () => {
    test.beforeEach(async ({ loginPage, applicationPickerPage, adminPage, usersAdminPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToUsers();
        await usersAdminPage.checkIsShown();
    });

    test('adds a user', async ({ usersAdminPage }) => {
        await usersAdminPage.addUser('user: bob');

        await usersAdminPage.checkUserIsListed('user: bob');
    });

    test('deletes a user', async ({ usersAdminPage }) => {
        await usersAdminPage.addUser('user: bob');
        await usersAdminPage.checkUserIsListed('user: bob');

        await usersAdminPage.deleteUser('user: bob');

        await usersAdminPage.checkUserIsDeleted('user: bob');
    });

    test('renames a user', async ({ usersAdminPage }) => {
        await usersAdminPage.addUser('user: bob');
        await usersAdminPage.checkUserIsListed('user: bob');

        await usersAdminPage.renameUser('user: bob', 'firstName: Robert');

        await usersAdminPage.checkUserIsRenamed('user: bob', 'firstName: Robert');
    });

    test('keeps Save disabled until the form is filled', async ({ usersAdminPage }) => {
        await usersAdminPage.startAddingUser();

        await usersAdminPage.checkCannotSaveYet();
    });
});
