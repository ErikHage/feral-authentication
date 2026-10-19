import { expectCount, expectText, expectUrl, expectVisible } from './assertions';
import { createDataTable } from './data-table';
import { createRoutedPageDriver } from './routed-page-driver';
import { urlOf } from './urls';

// The Last Login column: "-" until the user first logs in
const neverOrATime = /^(-|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/;

/** The users admin page, as Playwright sees it. Its table's rows are found by username. */
export function createUsersAdminPageDriver(page) {
    const main = page.getByRole('main');
    const applicationsHeading = main.getByRole('heading', { name: 'Available Applications' });
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

        /**
         * Today's behaviour when renaming: Save adds the edited user as a new
         * one, which the service refuses (the username is taken, and the
         * password empty), so the user keeps their name.
         */
        async rejectsTheRenameAsANewUser({ username, firstName }, newFirstName) {
            const what = `renaming ${username} to ${newFirstName}`;

            await expectVisible(alertSaying('error adding user'), what);
            await expectText(table.detailsIn(username).first(), firstName, what);
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

        /** Today's behaviour: a reload goes through login, on to the applications page. */
        async landsOnApplicationsPageAfterReload() {
            const what = 'reloading the users admin page';

            await expectUrl(page, urlOf('dashboard/applications'), what);
            await expectVisible(applicationsHeading, what);
        },
    };
}
