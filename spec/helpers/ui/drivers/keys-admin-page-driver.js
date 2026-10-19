import { expectEnabled, expectText, expectThat, expectValue, expectVisible } from './assertions';
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

        /**
         * Today's behaviour: the expiration entered in local time is shifted
         * by the UTC offset twice, once in the browser's conversion to UTC
         * and once more by the app's own, and the table lists the result.
         */
        async listsTheExpirationShiftedTwice({ keyName, expiration }) {
            const what = `listing the expiration of the key ${keyName}`;
            // The browser's own reading of the local time, and its offset
            const { inUtc, offsetMinutes } = await page.evaluate(local => {
                const date = new Date(local);
                return { inUtc: date.toISOString(), offsetMinutes: date.getTimezoneOffset() };
            }, expiration);
            const shiftedTwice = new Date(Date.parse(inUtc) + offsetMinutes * 60_000).toISOString();

            expectThat(offsetMinutes !== 0, 'a browser timezone off UTC, or a second shift is invisible',
                'UTC', what);
            await table.showAllRows();
            await expectText(expirationOf(keyName), shiftedTwice, what);
        },

        async openGenerateDialog() {
            await generateButton.click();
        },

        /** Today's behaviour: Generate can be pressed with nothing filled in. */
        async canGenerateFromAnEmptyForm() {
            const what = 'generating a key from an empty form';

            await expectValue(nameField, '', what);
            await expectValue(expirationField, '', what);
            await expectEnabled(dialog.getByRole('button', { name: 'Generate' }), what);
        },
    };
}
