import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { createAdminNav } from '../components/admin-nav';
import { createAppBar } from '../components/app-bar';
import { createDashboardNav } from '../components/dashboard-nav';

/** The steps every page the app routes to has, to spread into its page object. */
export function routedPageSteps(driver) {
    return {
        /**
         * Goes to the page's URL. The next step checks where that landed: a
         * visitor who isn't logged in lands on the login page. No parameters.
         */
        async open(...args) {
            parseDslArgs(args, {});

            await driver.open();
        },

        /** The browser is on this page. No parameters. */
        async checkIsShown(...args) {
            parseDslArgs(args, {});

            await driver.isShown();
        },
    };
}

/** The app bar, which every page has. */
export const shellComponents = world => ({
    appBar: createAppBar(world, world.drivers.appBar),
});

/** The app bar and the dashboard's navigation, which every dashboard page has. */
export const dashboardComponents = world => ({
    ...shellComponents(world),
    dashboardNav: createDashboardNav(world, world.drivers.dashboardNav),
});

/** The app bar and the admin navigation, which every admin page has. */
export const adminComponents = world => ({
    ...shellComponents(world),
    adminNav: createAdminNav(world, world.drivers.adminNav),
});
