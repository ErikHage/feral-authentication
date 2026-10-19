import { test } from '../../helpers/ui/ui-test';

// Keys can't be deleted, so each one generated here stays in the database,
// named ui-<alias>-<random>

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

    // DocumentsCurrentBehavior: the expiration is shifted by the UTC offset
    // twice, so 10:00 in New York is stored and listed as 18:00Z (backlog A1).
    // Should be 14:00Z.
    test('lists a key\'s expiration as entered', async ({ keysAdminPage }) => {
        await keysAdminPage.generateKey('key: signing');
        await keysAdminPage.checkKeyIsListed('key: signing');

        await keysAdminPage.checkExpirationIsAsEntered('key: signing');
    });

    // DocumentsCurrentBehavior: Generate's :disabled reads an async method,
    // which is always truthy, so it's never disabled and an empty form can be
    // sent (backlog A16). Should stay disabled until both fields are filled.
    // Nothing is generated: a key can't be deleted afterwards
    test('keeps Generate disabled until the form is filled', async ({ keysAdminPage }) => {
        await keysAdminPage.startGeneratingKey();

        await keysAdminPage.checkCannotGenerateYet();
    });
});
