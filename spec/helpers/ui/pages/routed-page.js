import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { createAppBar } from '../components/app-bar';
import { createBreadcrumbs } from '../components/breadcrumbs';
import { createNav } from '../components/nav';

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

        /**
         * Reloads the page. `checkIsShownAfterReload` checks that it stayed. No
         * parameters.
         */
        async reload(...args) {
            parseDslArgs(args, {});

            await driver.reload();
        },

        /** The browser is on this page. No parameters. */
        async checkIsShown(...args) {
            parseDslArgs(args, {});

            await driver.isShown();
        },

        /** After `reload`: the browser stayed on this page, never going via Login. No parameters. */
        async checkIsShownAfterReload(...args) {
            parseDslArgs(args, {});

            await driver.isShownAfterReload();
        },
    };
}

/** The app bar, its breadcrumbs and the side drawer, which every page has. */
export const shellComponents = world => ({
    appBar: createAppBar(world, world.drivers.appBar),
    breadcrumbs: createBreadcrumbs(world, world.drivers.breadcrumbs),
    nav: createNav(world, world.drivers.nav),
});
