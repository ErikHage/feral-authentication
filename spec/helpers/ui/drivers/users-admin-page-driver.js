import { expectCount, expectText, expectUrl, expectVisible } from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';
import { urlOf } from './urls';

/** The users admin page, as Playwright sees it. */
export function createUsersAdminPageDriver(page) {
    const main = page.getByRole('main');
    const applicationsHeading = main.getByRole('heading', { name: 'Available Applications' });
    const addButton = main.getByRole('button', { name: 'Add' });
    const alertSaying = message => main.getByRole('alert').filter({ hasText: message });

    // The table pages at 10 rows, in no particular order
    const rowsPerPage = main.getByRole('combobox');
    const rowsPerPageValue = rowsPerPage.getByRole('textbox');
    const row = username => main.getByRole('row')
        .filter({ has: page.getByRole('cell', { name: username, exact: true }) });
    // Every cell but Actions: first and last name, username, email, last
    // login and suspended
    const detailsIn = username => row(username).getByRole('cell')
        .filter({ hasNot: page.getByRole('button') });
    // The Actions icons' only accessible name is their glyph, so they're
    // found by their icon class
    const editIcon = username => row(username).locator('.mdi-pencil');
    const deleteIcon = username => row(username).locator('.mdi-delete');

    // Dialogs open outside main
    const userDialog = page.getByRole('dialog').filter({ hasText: /Add User|Edit User/ });
    const deleteDialog = page.getByRole('dialog').filter({ hasText: 'Delete User' });

    async function showAllRows() {
        // "All" is stored as -1
        if (await rowsPerPageValue.inputValue() !== '-1') {
            await rowsPerPage.click();
            await page.getByRole('option', { name: 'All' }).click();
        }
    }

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

        /** A user who has never logged in and isn't suspended. */
        async listsNewUser({ firstName, lastName, email, username }) {
            const what = `listing the user ${username}`;

            await showAllRows();
            await expectText(detailsIn(username), [firstName, lastName, username, email, '-', 'N'], what);
        },

        async renameUser(username, firstName) {
            await showAllRows();
            await editIcon(username).click();
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
            await expectText(detailsIn(username).first(), firstName, what);
        },

        async deleteUser(username) {
            await showAllRows();
            await deleteIcon(username).click();
            await expectText(deleteDialog.getByRole('cell'), username, `confirming the deletion of ${username}`);
            await deleteDialog.getByRole('button', { name: 'Delete' }).click();
        },

        /** After `deleteUser`: the row was there, so waiting for it to go is safe. */
        async noLongerListsUser(username) {
            const what = `deleting the user ${username}`;

            await expectCount(row(username), 0, what);
        },

        /** Today's behaviour: a reload goes through login, on to the applications page. */
        async landsOnApplicationsPageAfterReload() {
            const what = 'reloading the users admin page';

            await expectUrl(page, urlOf('dashboard/applications'), what);
            await expectVisible(applicationsHeading, what);
        },
    };
}
