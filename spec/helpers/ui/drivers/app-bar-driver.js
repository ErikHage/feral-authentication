import { expectThat } from './assertions';

/**
 * The app bar at the top of every page, as Playwright sees it: FrAppShell's
 * toolbar once someone is logged in, the app's name alone otherwise. Logout
 * is in the user's menu, behind their initials. Its click asserts nothing;
 * where it leads is the destination page driver's to check.
 */
export function createAppBarDriver(page) {
    const appBar = page.getByRole('banner');
    const userMenuButton = appBar.getByRole('button', { name: /^Account: / });
    const logoutItem = page.locator('.fr-app-user-menu').getByText('Logout', { exact: true });
    const anyControl = appBar.getByRole('link').or(appBar.getByRole('button'));

    return {
        async logOut() {
            await userMenuButton.click();
            await logoutItem.click();
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
