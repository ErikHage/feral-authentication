import { test } from '../../helpers/ui/ui-test';

test.describe('Roles admin page', () => {
    test.beforeEach(async ({ loginPage, applicationPickerPage, rolesAdminPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.nav.goToRoles();
        await rolesAdminPage.checkIsShown();
    });

    test('adds a role', async ({ rolesAdminPage }) => {
        await rolesAdminPage.addRole('role: tester');

        await rolesAdminPage.checkRoleIsListed('role: tester');
    });

    test('deletes a role', async ({ rolesAdminPage }) => {
        await rolesAdminPage.addRole('role: tester');
        await rolesAdminPage.checkRoleIsListed('role: tester');

        await rolesAdminPage.deleteRole('role: tester');

        await rolesAdminPage.checkRoleIsDeleted('role: tester');
    });

    test('rejects a second role with the same scope and title', async ({ rolesAdminPage }) => {
        await rolesAdminPage.addRole('role: tester');
        await rolesAdminPage.checkRoleIsListed('role: tester');

        await rolesAdminPage.addRoleAgain('role: tester');

        await rolesAdminPage.checkDuplicateIsRejected('role: tester');
    });

    test('keeps Save disabled until the form is filled', async ({ rolesAdminPage }) => {
        await rolesAdminPage.startAddingRole();

        await rolesAdminPage.checkCannotSaveYet();
    });
});
