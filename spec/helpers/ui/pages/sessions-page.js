import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { dashboardComponents, routedPageSteps } from './routed-page';

/** The logged-in user's sessions page, in words. */
export function createSessionsPage(world, driver) {
    return {
        ...dashboardComponents(world),
        ...routedPageSteps(driver),

        /**
         * The session this browser is logged in with is starred, and can't be
         * revoked. No parameters.
         */
        async checkMarksCurrentSession(...args) {
            parseDslArgs(args, {});

            await driver.marksTheCurrentSession();
        },

        /** Revokes the one session from another device. No parameters. */
        async revokeRemoteSession(...args) {
            parseDslArgs(args, {});

            await driver.revokeTheRemoteSession();
        },

        /** After `revokeRemoteSession`: it's no longer listed. No parameters. */
        async checkRemoteSessionIsRevoked(...args) {
            parseDslArgs(args, {});

            await driver.noLongerListsARemoteSession();
        },

        /** The current session shows the scope of the application it's for. No parameters. */
        async checkShowsScope(...args) {
            parseDslArgs(args, {});

            await driver.showsAnEmptyScope();
        },

        /** A user without the admin role is shown the session they're logged in with. No parameters. */
        async checkListsCurrentSession(...args) {
            parseDslArgs(args, {});

            await driver.showsTheRefusal();
        },
    };
}
