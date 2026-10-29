import { test } from '../../helpers/ui/ui-test';

test.describe('Keys admin page', () => {
    // Off UTC, so a second shift of the expiration shows (backlog A1); New
    // York is UTC-4 on the expiration's date
    test.use({ timezoneId: 'America/New_York' });

    test.beforeEach(async ({ loginPage, applicationPickerPage, adminPage, keysAdminPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToKeys();
        await keysAdminPage.checkIsShown();
    });

    test('generates a key', async ({ keysAdminPage }) => {
        await keysAdminPage.generateKey('key: signing');

        await keysAdminPage.checkKeyIsListed('key: signing');
    });

    test('lists a key\'s expiration as entered', async ({ keysAdminPage }) => {
        await keysAdminPage.generateKey('key: signing');
        await keysAdminPage.checkKeyIsListed('key: signing');

        await keysAdminPage.checkExpirationIsAsEntered('key: signing');
    });

    test('keeps Generate disabled until the form is filled', async ({ keysAdminPage }) => {
        await keysAdminPage.startGeneratingKey();

        await keysAdminPage.checkCannotGenerateYet();
    });
});
