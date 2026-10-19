/**
 * The admin area's own navigation bar, under the app bar on every admin
 * page, as Playwright sees it. It only clicks.
 */
export function createAdminNavDriver(page) {
    const nav = page.getByRole('main');
    const link = name => nav.getByRole('link', { name, exact: true });

    return {
        async goToRoles() {
            await link('Roles').click();
        },

        async goToUsers() {
            await link('Users').click();
        },

        async goToAuthorization() {
            await link('Authorization').click();
        },

        async goToKeys() {
            await link('Keys').click();
        },

        async goToApplications() {
            await link('Applications').click();
        },
    };
}
