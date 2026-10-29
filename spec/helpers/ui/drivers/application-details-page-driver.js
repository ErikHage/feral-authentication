import {
    expectCount, expectDisabled, expectEnabled, expectUrl, expectValue, expectVisible,
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
    const rotateSaveButton = rotateDialog.getByRole('button', { name: 'Save' });

    const openRotateDialog = () => main.getByRole('button', { name: 'Rotate Key' }).click();
    const chooseNewKey = keyName => chooseOption(page, rotateDialog.getByRole('combobox'), keyName);

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
            await openRotateDialog();
            await chooseNewKey(keyName);
            await rotateSaveButton.click();
        },

        openRotateDialog,

        chooseNewKey,

        async cannotRotateWithoutAKey() {
            const what = 'rotating to no key';

            await expectVisible(rotateDialog, what);
            await expectDisabled(rotateSaveButton, what);
        },

        async canRotate(keyName) {
            await expectEnabled(rotateSaveButton, `rotating to ${keyName}`);
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
         * The page says so, then shows the name as reloaded from the service.
         * Save is enabled until the reload, so it being disabled is the sign
         * the field now shows the saved name, not the typed one.
         */
        async savesTheName({ applicationName }, newName) {
            const what = `renaming ${applicationName} to ${newName}`;

            await expectVisible(alertSaying(`Application ${newName} saved`), what);
            await expectDisabled(saveButton, what);
            await expectValue(field('Application Name'), newName, what);
        },
    };
}
