import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

/**
 * The app bar at the top of every page, in words. Every page object exposes
 * it as `appBar`. Logged in, Logout is in the user's menu; the Menu button
 * that `nav` presses on a phone is here too.
 */
export function createAppBar(world, driver) {
    return {
        /** Opens the user's menu and presses Logout. No parameters. */
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
