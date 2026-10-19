import {
    expectCount, expectDisabled, expectUrl, expectValue, expectVisible,
} from './assertions';
import { chooseOption } from './select';
import { urlOf } from './urls';

/**
 * An application's details page, as Playwright sees it. Its path holds the
 * application's id, so it's reached from the applications page, not opened.
 */
export function createApplicationDetailsPageDriver(page) {
    const main = page.getByRole('main');
    const heading = main.getByRole('heading', { name: 'Application Details' });
    const field = label => main.getByLabel(label, { exact: true });
    const saveButton = main.getByRole('button', { name: 'Save' });
    const alertSaying = message => main.getByRole('alert').filter({ hasText: message });

    // Dialogs open outside main
    const rotateDialog = page.getByRole('dialog').filter({ hasText: 'Choose New Key' });

    return {
        /** The previous key's fields show only after a rotation. */
        async showsApplication({ applicationName, applicationUrl, scope }, keyName, previousKeyName) {
            const what = `showing the details of ${applicationName}`;

            await expectUrl(page, new RegExp(`^${urlOf('admin/applications/')}[0-9a-f-]{36}$`), what);
            await expectVisible(heading, what);
            await expectValue(field('Application Name'), applicationName, what);
            await expectValue(field('Application Landing Page'), applicationUrl, what);
            await expectValue(field('Roles Scope'), scope, what);
            await expectValue(field('Key Pair Name'), keyName, what);
            if (previousKeyName === undefined) {
                await expectCount(field('Previous Key Pair Name'), 0, what);
            } else {
                await expectValue(field('Previous Key Pair Name'), previousKeyName, what);
            }
        },

        async rotateKey(keyName) {
            await main.getByRole('button', { name: 'Rotate Key' }).click();
            await chooseOption(page, rotateDialog.getByRole('combobox'), keyName);
            await rotateDialog.getByRole('button', { name: 'Save' }).click();
        },

        async changeName(applicationName) {
            await field('Application Name').fill(applicationName);
        },

        async save() {
            await saveButton.click();
        },

        async cannotSaveAnEmptyName() {
            const what = 'saving an empty application name';

            await expectVisible(alertSaying('applicationName is required'), what);
            await expectDisabled(saveButton, what);
        },

        /**
         * Today's behaviour on Save: nothing is sent, the page reloads the
         * application, and the name goes back to the saved one.
         */
        async discardsTheChange({ applicationName }, newName) {
            await expectValue(field('Application Name'), applicationName, `renaming ${applicationName} to ${newName}`);
        },
    };
}
