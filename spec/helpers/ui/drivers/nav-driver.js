import { expectEventually, expectThat, expectVisible } from './assertions';

/**
 * The side drawer, with a link to every page, as Playwright sees it.
 *
 * It's FrAppShell's navigation drawer, a `navigation` named "Main": a data
 * table's pagination is a `navigation` too. It's there only once someone is
 * logged in. On a desktop it's always there, either expanded or a rail of
 * icons; its own Collapse navigation button (by the app's name) makes it a
 * rail, and the rail's Expand navigation button (the logo) expands it again.
 * A rail's links keep their names, so they're found the same way in both.
 * Its links are grouped under the headings User and Admin. A rail is
 * recognised by what it shows: a separator in place of the headings, and a
 * drawer narrow enough for icons alone.
 *
 * On a phone (below Vuetify's md breakpoint, 960px) it's hidden, and the
 * banner's Menu button slides it in over the page. Hidden, it's off screen,
 * but Playwright's role locators still find its links, and call them
 * visible. So `goTo` opens it first.
 */

// Each page's link. Both groups have an Applications page; the user's is
// "My Applications", so that every link has a name of its own
const destinations = {
    myApplications: 'My Applications',
    profile: 'Profile',
    sessions: 'Sessions',
    roles: 'Roles',
    users: 'Users',
    authorization: 'Authorization',
    keys: 'Keys',
    applications: 'Applications',
};

const phoneWidth = 960;

// FrAppShell's rail is 64px wide, and the expanded drawer 240px
const railWidth = 100;

export function createNavDriver(page) {
    const drawer = page.getByRole('navigation', { name: 'Main', exact: true });
    const collapseButton = drawer.getByRole('button', { name: 'Collapse navigation' });
    const expandButton = drawer.getByRole('button', { name: 'Expand navigation' });
    const menuButton = page.getByRole('banner').getByRole('button', { name: 'Menu' });
    const adminHeading = drawer.getByText('Admin', { exact: true });
    const separators = drawer.getByRole('separator');
    const onAPhone = () => (page.viewportSize()?.width ?? phoneWidth) < phoneWidth;
    const drawerWidth = async () => (await drawer.boundingBox())?.width ?? 0;

    return {
        /** Follows the link to `destination`, a key of `destinations`, opening the drawer first on a phone. */
        async goTo(destination) {
            if (onAPhone()) {
                await menuButton.click();
            }
            await drawer.getByRole('link', { name: destinations[destination], exact: true }).click();
        },

        async collapseToRail() {
            await this.isExpanded();
            await collapseButton.click();
            await this.isRail();
        },

        async expand() {
            await this.isRail();
            await expandButton.click();
            await this.isExpanded();
        },

        /** Icons only: a separator where the headings were, in a narrow drawer. */
        async isRail() {
            const what = 'the side drawer, as a rail';

            await expectVisible(separators.first(), what);
            await expectEventually(async () => (await drawerWidth()) < railWidth,
                `the drawer narrower than ${railWidth}px`, what);
            const headings = await adminHeading.count();
            expectThat(headings === 0, 'no Admin heading', `${headings} shown`, what);
        },

        /** Expanded: the headings, and no separator in their place. */
        async isExpanded() {
            const what = 'the side drawer, expanded';

            await expectVisible(adminHeading, what);
            await expectEventually(async () => (await drawerWidth()) >= railWidth,
                `the drawer at least ${railWidth}px wide`, what);
            const shown = await separators.count();
            expectThat(shown === 0, 'no separator', `${shown} shown`, what);
        },

        /**
         * Reads the page once, without retrying: a retrying check would pass
         * while the page is still rendering. Call it after a step that proves
         * the page has settled.
         */
        async isAbsent() {
            const count = await drawer.count();

            expectThat(count === 0, 'no side drawer', `${count}`, 'checking the side drawer');
        },
    };
}
