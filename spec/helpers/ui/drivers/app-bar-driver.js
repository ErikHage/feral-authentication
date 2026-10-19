import { expectThat } from './assertions';

/**
 * The app bar at the top of every page, as Playwright sees it. Its clicks
 * assert nothing; where they lead is the destination page driver's to check.
 */
export function createAppBarDriver(page) {
    const appBar = page.getByRole('banner');
    const dashboardLink = appBar.getByRole('link', { name: 'Dashboard' });
    const adminLink = appBar.getByRole('link', { name: 'Admin' });
    const logoutButton = appBar.getByRole('button', { name: 'Logout' });
    const anyControl = appBar.getByRole('link').or(appBar.getByRole('button'));

    return {
        async goToDashboard() {
            await dashboardLink.click();
        },

        async goToAdmin() {
            await adminLink.click();
        },

        async logOut() {
            await logoutButton.click();
        },

        /**
         * Reads the app bar once, without retrying: a retrying check would pass
         * while the page is still rendering. Call it after a step that proves
         * the page has settled.
         */
        async offersNothing() {
            const count = await anyControl.count();

            expectThat(count === 0, 'no links or buttons in the app bar', `${count}`, 'checking the app bar');
        },
    };
}
