import { expectDisabled, expectText, expectThat, expectValue, expectVisible } from './assertions';
import { createDataTable } from './data-table';
import { createRoutedPageDriver } from './routed-page-driver';

/** The keys admin page, as Playwright sees it. Its table's rows are found by key name. */
export function createKeysAdminPageDriver(page) {
    const main = page.getByRole('main');
    const generateButton = main.getByRole('button', { name: 'Generate' });
    const table = createDataTable(page);
    // Key Id, Key Name and Expiration
    const expirationOf = keyName => table.detailsIn(keyName).nth(2);

    // Dialogs open outside main
    const dialog = page.getByRole('dialog').filter({ hasText: 'Generate Key' });
    const nameField = dialog.getByLabel('Key Name');
    const expirationField = dialog.getByLabel('Expiration Date');

    return {
        ...createRoutedPageDriver(page, {
            name: 'the keys admin page',
            path: 'admin/keys',
            marker: main => main.getByText('Manage Keys', { exact: true }),
        }),

        /** `expiration` as a datetime-local field takes it, e.g. 2030-06-01T10:00. */
        async generateKey({ keyName, expiration }) {
            await generateButton.click();
            await nameField.fill(keyName);
            await expirationField.fill(expiration);
            await dialog.getByRole('button', { name: 'Generate' }).click();
        },

        async listsKey({ keyName }) {
            await table.showAllRows();
            await expectVisible(table.row(keyName), `listing the key ${keyName}`);
        },

        /** The table lists the expiration entered in local time as that moment in UTC. */
        async listsTheExpirationAsEntered({ keyName, expiration }) {
            const what = `listing the expiration of the key ${keyName}`;
            // The browser's own reading of the local time, and its offset
            const { inUtc, offsetMinutes } = await page.evaluate(local => {
                const date = new Date(local);
                return { inUtc: date.toISOString(), offsetMinutes: date.getTimezoneOffset() };
            }, expiration);

            expectThat(offsetMinutes !== 0, 'a browser timezone off UTC, or a wrong shift is invisible',
                'UTC', what);
            await table.showAllRows();
            await expectText(expirationOf(keyName), inUtc, what);
        },

        async openGenerateDialog() {
            await generateButton.click();
        },

        async cannotGenerateFromAnEmptyForm() {
            const what = 'generating a key from an empty form';

            await expectValue(nameField, '', what);
            await expectValue(expirationField, '', what);
            await expectDisabled(dialog.getByRole('button', { name: 'Generate' }), what);
        },
    };
}
