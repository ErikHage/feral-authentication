import { expectCount, expectText, expectVisible } from './assertions';
import { createDataTable } from './data-table';
import { createRoutedPageDriver } from './routed-page-driver';

/** The roles admin page, as Playwright sees it. Its table's rows are found by scope. */
export function createRolesAdminPageDriver(page) {
    const main = page.getByRole('main');
    const addButton = main.getByRole('button', { name: 'Add' });
    const alertSaying = message => main.getByRole('alert').filter({ hasText: message });
    const table = createDataTable(page);

    // Dialogs open outside main
    const addDialog = page.getByRole('dialog').filter({ hasText: 'Add Role' });
    const deleteDialog = page.getByRole('dialog').filter({ hasText: 'Delete Role' });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the roles admin page',
            path: 'admin/roles',
            marker: main => main.getByText('Manage Roles', { exact: true }),
        }),

        async addRole({ scope, title, description }) {
            await addButton.click();
            await addDialog.getByLabel('Scope').fill(scope);
            await addDialog.getByLabel('Title').fill(title);
            await addDialog.getByLabel('Description').fill(description);
            await addDialog.getByRole('button', { name: 'Save' }).click();
        },

        async listsRole({ scope, title, description }) {
            const what = `listing the role ${scope}/${title}`;

            await table.showAllRows();
            await expectText(table.detailsIn(scope), [scope, title, description], what);
        },

        /**
         * Today's behaviour when a role is added twice: the service answers
         * 500, and the page shows the HTTP client's own message for it. The
         * role is still listed, once.
         */
        async showsTheFailedRequest({ scope, title }) {
            const what = `adding the role ${scope}/${title} a second time`;

            await expectVisible(alertSaying('Request failed with status code 500'), what);
            await expectCount(table.row(scope), 1, what);
        },

        async deleteRole({ scope, title }) {
            await table.showAllRows();
            await table.icon(scope, 'delete').click();
            await expectText(deleteDialog.getByRole('cell'), [scope, title], `confirming the deletion of ${scope}/${title}`);
            await deleteDialog.getByRole('button', { name: 'Delete' }).click();
        },

        /** After `deleteRole`: the row was there, so waiting for it to go is safe. */
        async noLongerListsRole({ scope, title }) {
            const what = `deleting the role ${scope}/${title}`;

            await expectCount(table.row(scope), 0, what);
        },
    };
}
