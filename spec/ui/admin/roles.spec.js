import { test } from '../../helpers/ui/ui-test';

test.describe('Roles admin page', () => {
    test.beforeEach(async ({ loginPage, applicationPickerPage, adminPage, rolesAdminPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToRoles();
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

    // DocumentsCurrentBehavior: the service answers 500 (pinned in its own
    // acceptance suite), and the page shows the HTTP client's "Request failed
    // with status code 500". Should say the role already exists.
    test('rejects a second role with the same scope and title', async ({ rolesAdminPage }) => {
        await rolesAdminPage.addRole('role: tester');
        await rolesAdminPage.checkRoleIsListed('role: tester');

        await rolesAdminPage.addRoleAgain('role: tester');

        await rolesAdminPage.checkDuplicateIsRejected('role: tester');
    });
});
