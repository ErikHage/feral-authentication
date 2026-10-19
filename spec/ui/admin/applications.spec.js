import { test } from '../../helpers/ui/ui-test';

// Keys and applications can't be deleted, so each one added here stays in
// the database, named ui-<alias>-<random>

test.describe('Applications admin page', () => {
    test.beforeEach(async ({ loginPage, applicationPickerPage, adminPage, keysAdminPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToKeys();
        await keysAdminPage.generateKey('key: first');
        await keysAdminPage.checkKeyIsListed('key: first');
    });

    test('adds an application', async ({ keysAdminPage, applicationsAdminPage }) => {
        await keysAdminPage.adminNav.goToApplications();

        await applicationsAdminPage.addApplication('application: game', 'key: first');

        await applicationsAdminPage.checkApplicationIsListed('application: game');
    });

    test('shows an application\'s details', async ({ keysAdminPage, applicationsAdminPage, applicationDetailsPage }) => {
        await keysAdminPage.adminNav.goToApplications();
        await applicationsAdminPage.addApplication('application: game', 'key: first');
        await applicationsAdminPage.checkApplicationIsListed('application: game');

        await applicationsAdminPage.openDetails('application: game');

        await applicationDetailsPage.checkShowsApplication('application: game', 'key: first');
    });

    test('rotates an application\'s key', async ({ keysAdminPage, applicationsAdminPage, applicationDetailsPage }) => {
        await keysAdminPage.generateKey('key: second');
        await keysAdminPage.checkKeyIsListed('key: second');
        await keysAdminPage.adminNav.goToApplications();
        await applicationsAdminPage.addApplication('application: game', 'key: first');
        await applicationsAdminPage.checkApplicationIsListed('application: game');
        await applicationsAdminPage.openDetails('application: game');
        await applicationDetailsPage.checkShowsApplication('application: game', 'key: first');

        await applicationDetailsPage.rotateKey('key: second');

        await applicationDetailsPage.checkShowsApplication('application: game', 'key: second', 'previousKey: first');
    });

    // The unit suite pins Save as staying enabled here (backlog A21, the same
    // cause as A9). In a browser it doesn't
    test('keeps Save disabled while the name is empty', async ({
        keysAdminPage, applicationsAdminPage, applicationDetailsPage,
    }) => {
        await keysAdminPage.adminNav.goToApplications();
        await applicationsAdminPage.addApplication('application: game', 'key: first');
        await applicationsAdminPage.checkApplicationIsListed('application: game');
        await applicationsAdminPage.openDetails('application: game');
        await applicationDetailsPage.checkShowsApplication('application: game', 'key: first');
        await applicationDetailsPage.changeName('name: renamed');

        await applicationDetailsPage.clearName();

        await applicationDetailsPage.checkCannotSave();
    });

    // DocumentsCurrentBehavior: Save sends nothing (updateApplicationDetails is
    // a TODO); it reloads the application, and the name goes back to the saved
    // one (backlog A22). Should save the new name.
    test('saves a new name', async ({ keysAdminPage, applicationsAdminPage, applicationDetailsPage }) => {
        await keysAdminPage.adminNav.goToApplications();
        await applicationsAdminPage.addApplication('application: game', 'key: first');
        await applicationsAdminPage.checkApplicationIsListed('application: game');
        await applicationsAdminPage.openDetails('application: game');
        await applicationDetailsPage.checkShowsApplication('application: game', 'key: first');
        await applicationDetailsPage.changeName('name: renamed');

        await applicationDetailsPage.save();

        await applicationDetailsPage.checkNameIsSaved('application: game', 'name: renamed');
    });
});
