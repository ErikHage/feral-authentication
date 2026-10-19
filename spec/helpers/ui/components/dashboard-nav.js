import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

/**
 * The dashboard's own navigation, in words. Every dashboard page exposes it
 * as `dashboardNav`. Where a step leads is checked by the destination page.
 */
export function createDashboardNav(world, driver) {
    return {
        /** Follows the Applications link. No parameters. */
        async goToApplications(...args) {
            parseDslArgs(args, {});

            await driver.goToApplications();
        },

        /** Follows the Profile link. No parameters. */
        async goToProfile(...args) {
            parseDslArgs(args, {});

            await driver.goToProfile();
        },

        /** Follows the Sessions link. No parameters. */
        async goToSessions(...args) {
            parseDslArgs(args, {});

            await driver.goToSessions();
        },
    };
}
