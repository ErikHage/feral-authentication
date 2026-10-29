import { test } from '../../helpers/ui/ui-test';

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

    test('keeps the Rotate Key dialog\'s Save disabled until a key is chosen', async ({
        keysAdminPage, applicationsAdminPage, applicationDetailsPage,
    }) => {
        await keysAdminPage.generateKey('key: second');
        await keysAdminPage.checkKeyIsListed('key: second');
        await keysAdminPage.adminNav.goToApplications();
        await applicationsAdminPage.addApplication('application: game', 'key: first');
        await applicationsAdminPage.checkApplicationIsListed('application: game');
        await applicationsAdminPage.openDetails('application: game');
        await applicationDetailsPage.checkShowsApplication('application: game', 'key: first');
        await applicationDetailsPage.startRotatingKey();

        await applicationDetailsPage.checkCannotRotateYet();
        await applicationDetailsPage.chooseNewKey('key: second');
        await applicationDetailsPage.checkCanRotateTo('key: second');
    });

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

test.describe('Applications admin page, adding nothing', () => {
    // No key, and nothing is created
    test.beforeEach(async ({ loginPage, applicationPickerPage, adminPage, applicationsAdminPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
        await applicationPickerPage.appBar.goToAdmin();
        await adminPage.adminNav.goToApplications();
        await applicationsAdminPage.checkIsShown();
    });

    test('keeps Create disabled until the form is filled', async ({ applicationsAdminPage }) => {
        await applicationsAdminPage.startAddingApplication();

        await applicationsAdminPage.checkCannotCreateYet();
    });
});
