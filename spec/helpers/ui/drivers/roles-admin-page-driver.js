import { expectCount, expectDisabled, expectText, expectValue, expectVisible } from './assertions';
import { createDataTable } from './data-table';
import { messageSaying } from './messages';
import { createRoutedPageDriver } from './routed-page-driver';
import { openPath } from './urls';

/** The roles admin page, as Playwright sees it. Its table's rows are found by scope. */
export function createRolesAdminPageDriver(page) {
    const main = page.getByRole('main');
    const addButton = main.getByRole('button', { name: 'Add' });
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

        /** Goes to `/admin`, which has no page of its own. */
        async openArea() {
            await openPath(page, 'admin');
        },

        async addRole({ scope, title, description }) {
            await addButton.click();
            await addDialog.getByLabel('Scope').fill(scope);
            await addDialog.getByLabel('Title').fill(title);
            await addDialog.getByLabel('Description').fill(description);
            await addDialog.getByRole('button', { name: 'Save' }).click();
        },

        async openAddDialog() {
            await addButton.click();
        },

        async cannotSaveAnEmptyRole() {
            const what = 'saving a role from an empty form';

            await expectValue(addDialog.getByLabel('Scope'), '', what);
            await expectValue(addDialog.getByLabel('Description'), '', what);
            await expectDisabled(addDialog.getByRole('button', { name: 'Save' }), what);
        },

        async listsRole({ scope, title, description }) {
            const what = `listing the role ${scope}/${title}`;

            await table.showAllRows();
            await expectText(table.detailsIn(scope), [scope, title, description], what);
        },

        /** The role is still listed, once. */
        async saysItAlreadyExists({ scope, title }) {
            const what = `adding the role ${scope}/${title} a second time`;

            await expectVisible(messageSaying(page, `Couldn't add the role ${scope}/${title}: it already exists`), what);
            await expectCount(table.row(scope), 1, what);
        },

        async deleteRole({ scope, title }) {
            await table.showAllRows();
            await table.action(scope, `Delete ${scope}/${title}`).click();
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
