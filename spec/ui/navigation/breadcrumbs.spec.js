import { test } from '../../helpers/ui/ui-test';

test.describe('Breadcrumbs', () => {
    test.beforeEach(async ({ loginPage, applicationPickerPage }) => {
        await loginPage.open();
        await loginPage.logIn('user: admin');
        await applicationPickerPage.checkIsShown();
    });

    test("lead from the page's section to the page", async ({ applicationPickerPage, sessionsPage }) => {
        await applicationPickerPage.nav.goToSessions();
        await sessionsPage.checkIsShown();

        await sessionsPage.breadcrumbs.checkLeadsToPage('section: User', 'page: Sessions');
    });

    test("return to the section's first page", async ({ applicationPickerPage, keysAdminPage, rolesAdminPage }) => {
        await applicationPickerPage.nav.goToKeys();
        await keysAdminPage.checkIsShown();

        await keysAdminPage.breadcrumbs.goToSection('section: Admin');

        await rolesAdminPage.checkIsShown();
    });

    test.describe('on an application', () => {
        test.beforeEach(async ({ applicationPickerPage, keysAdminPage, applicationsAdminPage, applicationDetailsPage }) => {
            await applicationPickerPage.nav.goToKeys();
            await keysAdminPage.generateKey('key: first');
            await keysAdminPage.checkKeyIsListed('key: first');
            await keysAdminPage.nav.goToApplications();
            await applicationsAdminPage.addApplication('application: game', 'key: first');
            await applicationsAdminPage.checkApplicationIsListed('application: game');
            await applicationsAdminPage.openDetails('application: game');
            await applicationDetailsPage.checkShowsApplication('application: game', 'key: first');
        });

        test('lead from Applications to the application', async ({ applicationDetailsPage }) => {
            await applicationDetailsPage.breadcrumbs.checkLeadsToApplication('application: game');
        });

        test('return to the application list', async ({ applicationDetailsPage, applicationsAdminPage }) => {
            await applicationDetailsPage.breadcrumbs.goToApplications();

            await applicationsAdminPage.checkIsShown();
        });
    });

    test.describe('on a phone', () => {
        test.use({ viewport: { width: 390, height: 844 } });

        test('show the page alone', async ({ applicationPickerPage, sessionsPage }) => {
            await applicationPickerPage.nav.goToSessions();
            await sessionsPage.checkIsShown();

            await sessionsPage.breadcrumbs.checkShowsOnlyPage('page: Sessions');
        });
    });
});
