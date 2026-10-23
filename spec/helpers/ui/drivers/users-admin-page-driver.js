import { expectCount, expectDisabled, expectText, expectValue, expectVisible } from './assertions';
import { createDataTable } from './data-table';
import { createRoutedPageDriver } from './routed-page-driver';

// The Last Login column: "-" until the user first logs in
const neverOrATime = /^(-|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/;

/** The users admin page, as Playwright sees it. Its table's rows are found by username. */
export function createUsersAdminPageDriver(page) {
    const main = page.getByRole('main');
    const addButton = main.getByRole('button', { name: 'Add' });
    const alertSaying = message => main.getByRole('alert').filter({ hasText: message });
    const table = createDataTable(page);

    // Dialogs open outside main
    const userDialog = page.getByRole('dialog').filter({ hasText: /Add User|Edit User/ });
    const deleteDialog = page.getByRole('dialog').filter({ hasText: 'Delete User' });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the users admin page',
            path: 'admin/users',
            marker: main => main.getByText('Manage Users', { exact: true }),
        }),

        async addUser({ firstName, lastName, email, username, password }) {
            await addButton.click();
            await userDialog.getByLabel('First Name').fill(firstName);
            await userDialog.getByLabel('Last Name').fill(lastName);
            await userDialog.getByLabel('Email').fill(email);
            await userDialog.getByLabel('Username').fill(username);
            // By role: the show-password button is labelled "Password…" too
            await userDialog.getByRole('textbox', { name: 'Password' }).fill(password);
            await userDialog.getByRole('button', { name: 'Save' }).click();
        },

        async openAddDialog() {
            await addButton.click();
        },

        async cannotSaveAnEmptyUser() {
            const what = 'saving a user from an empty form';

            await expectValue(userDialog.getByLabel('First Name'), '', what);
            await expectValue(userDialog.getByRole('textbox', { name: 'Password' }), '', what);
            await expectDisabled(userDialog.getByRole('button', { name: 'Save' }), what);
        },

        /** A user who isn't suspended, and may or may not have logged in. */
        async listsUser({ firstName, lastName, email, username }) {
            const what = `listing the user ${username}`;

            await table.showAllRows();
            await expectText(table.detailsIn(username), [firstName, lastName, username, email, neverOrATime, 'N'], what);
        },

        async renameUser(username, firstName) {
            await table.showAllRows();
            await table.icon(username, 'pencil').click();
            await userDialog.getByLabel('First Name').fill(firstName);
            await userDialog.getByRole('button', { name: 'Save' }).click();
        },

        async listsTheUserRenamed(username, newFirstName) {
            const what = `renaming ${username} to ${newFirstName}`;

            await expectVisible(alertSaying('User updated successfully!'), what);
            await expectText(table.detailsIn(username).first(), newFirstName, what);
        },

        async deleteUser(username) {
            await table.showAllRows();
            await table.icon(username, 'delete').click();
            await expectText(deleteDialog.getByRole('cell'), username, `confirming the deletion of ${username}`);
            await deleteDialog.getByRole('button', { name: 'Delete' }).click();
        },

        /** After `deleteUser`: the row was there, so waiting for it to go is safe. */
        async noLongerListsUser(username) {
            const what = `deleting the user ${username}`;

            await expectCount(table.row(username), 0, what);
        },
    };
}
