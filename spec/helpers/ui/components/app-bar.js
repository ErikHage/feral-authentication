import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

/**
 * The app bar at the top of every page, in words. Every page object exposes
 * it as `appBar`. Where a step leads is checked by the destination page.
 */
export function createAppBar(world, driver) {
    return {
        /** Follows the Dashboard link. No parameters. */
        async goToDashboard(...args) {
            parseDslArgs(args, {});

            await driver.goToDashboard();
        },

        /** Follows the Admin link. No parameters. */
        async goToAdmin(...args) {
            parseDslArgs(args, {});

            await driver.goToAdmin();
        },

        /** Presses Logout. No parameters. */
        async logOut(...args) {
            parseDslArgs(args, {});

            await driver.logOut();
        },

        /**
         * The app bar has no links or buttons, as for a visitor who isn't logged
         * in. Check where the browser is first, so the page has settled. No
         * parameters.
         */
        async checkOffersNothing(...args) {
            parseDslArgs(args, {});

            await driver.offersNothing();
        },
    };
}
