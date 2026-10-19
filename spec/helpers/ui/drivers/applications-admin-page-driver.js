import { expectText } from './assertions';
import { createDataTable } from './data-table';
import { createRoutedPageDriver } from './routed-page-driver';
import { chooseOption } from './select';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** The applications admin page, as Playwright sees it. Its table's rows are found by name. */
export function createApplicationsAdminPageDriver(page) {
    const main = page.getByRole('main');
    const addButton = main.getByRole('button', { name: 'Add' });
    const table = createDataTable(page);

    // Dialogs open outside main
    const dialog = page.getByRole('dialog').filter({ hasText: 'Add Application' });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the applications admin page',
            path: 'admin/applications',
            marker: main => main.getByText('Manage Applications', { exact: true }),
        }),

        async addApplication({ applicationName, applicationUrl, scope }, keyName) {
            await addButton.click();
            await dialog.getByLabel('Name', { exact: true }).fill(applicationName);
            await dialog.getByLabel('Url').fill(applicationUrl);
            await dialog.getByLabel('Scope').fill(scope);
            await chooseOption(page, dialog.getByRole('combobox'), keyName);
            await dialog.getByRole('button', { name: 'Create' }).click();
        },

        /** A new application: a key id, and no previous one. */
        async listsNewApplication({ applicationName, applicationUrl, scope }) {
            await table.showAllRows();
            await expectText(table.detailsIn(applicationName), [applicationName, applicationUrl, scope, uuid, ''],
                `listing the application ${applicationName}`);
        },

        async openDetails(applicationName) {
            await table.showAllRows();
            await table.icon(applicationName, 'pencil').click();
        },
    };
}
