import { selectField } from './select';

/**
 * The admin pages' tables, as Playwright sees them: a Vuetify data table in
 * `main`, with an Actions column of icons. A row is found by a cell that
 * reads `key` exactly: a username, or a role's scope.
 *
 * Not a page driver: page drivers build one to share its locators.
 */
export function createDataTable(page) {
    const main = page.getByRole('main');

    // The table pages at 10 rows, and the service lists in no particular order
    const rowsPerPage = selectField(page, main, 'Items per page:');
    const rowsPerPageValue = main.getByRole('combobox', { name: 'Items per page:' });

    const row = key => main.getByRole('row')
        .filter({ has: page.getByRole('cell', { name: key, exact: true }) });

    return {
        row,

        /** Every cell but Actions, the one with buttons in it. */
        detailsIn: key => row(key).getByRole('cell').filter({ hasNot: page.getByRole('button') }),

        /** An Actions icon, by its name: "Edit alice", "Delete feral/admin". */
        action: (key, name) => row(key).getByRole('button', { name, exact: true }),

        /** Shows every row on one page, so no row is out of sight on another. */
        async showAllRows() {
            // The input holds the shown option's title
            if (await rowsPerPageValue.inputValue() !== 'All') {
                await rowsPerPage.click();
                await page.getByRole('option', { name: 'All' }).click();
            }
        },
    };
}
