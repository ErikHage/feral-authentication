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
    const rowsPerPage = main.getByRole('combobox');
    const rowsPerPageValue = rowsPerPage.getByRole('textbox');

    const row = key => main.getByRole('row')
        .filter({ has: page.getByRole('cell', { name: key, exact: true }) });

    return {
        row,

        /** Every cell but Actions, the one with buttons in it. */
        detailsIn: key => row(key).getByRole('cell').filter({ hasNot: page.getByRole('button') }),

        // The Actions icons' only accessible name is their glyph, so they're
        // found by their icon class
        icon: (key, name) => row(key).locator(`.mdi-${name}`),

        /** Shows every row on one page, so no row is out of sight on another. */
        async showAllRows() {
            // "All" is stored as -1
            if (await rowsPerPageValue.inputValue() !== '-1') {
                await rowsPerPage.click();
                await page.getByRole('option', { name: 'All' }).click();
            }
        },
    };
}
