/**
 * The dashboard's own navigation bar, under the app bar on every dashboard
 * page, as Playwright sees it. It only clicks.
 */
export function createDashboardNavDriver(page) {
    const nav = page.getByRole('main');
    const link = name => nav.getByRole('link', { name, exact: true });

    return {
        async goToApplications() {
            await link('Applications').click();
        },

        async goToProfile() {
            await link('Profile').click();
        },

        async goToSessions() {
            await link('Sessions').click();
        },
    };
}
