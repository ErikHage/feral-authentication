import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

/**
 * The admin area's own navigation, in words. Every admin page exposes it as
 * `adminNav`. Where a step leads is checked by the destination page.
 */
export function createAdminNav(world, driver) {
    return {
        /** Follows the Roles link. No parameters. */
        async goToRoles(...args) {
            parseDslArgs(args, {});

            await driver.goToRoles();
        },

        /** Follows the Users link. No parameters. */
        async goToUsers(...args) {
            parseDslArgs(args, {});

            await driver.goToUsers();
        },

        /** Follows the Authorization link. No parameters. */
        async goToAuthorization(...args) {
            parseDslArgs(args, {});

            await driver.goToAuthorization();
        },

        /** Follows the Keys link. No parameters. */
        async goToKeys(...args) {
            parseDslArgs(args, {});

            await driver.goToKeys();
        },

        /** Follows the Applications link. No parameters. */
        async goToApplications(...args) {
            parseDslArgs(args, {});

            await driver.goToApplications();
        },
    };
}
