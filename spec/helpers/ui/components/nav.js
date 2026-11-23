import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

/**
 * The side drawer, with a link to every page, in words. Every page object
 * exposes it as `nav`. Where a step leads is checked by the destination page.
 */
export function createNav(world, driver) {
    // Each step follows one link, and takes no parameters
    const goTo = destination => async (...args) => {
        parseDslArgs(args, {});

        await driver.goTo(destination);
    };

    return {
        /** Follows the User group's My Applications link. No parameters. */
        goToMyApplications: goTo('myApplications'),

        /** Follows the Profile link. No parameters. */
        goToProfile: goTo('profile'),

        /** Follows the Sessions link. No parameters. */
        goToSessions: goTo('sessions'),

        /** Follows the Roles link. No parameters. */
        goToRoles: goTo('roles'),

        /** Follows the Users link. No parameters. */
        goToUsers: goTo('users'),

        /** Follows the Authorization link. No parameters. */
        goToAuthorization: goTo('authorization'),

        /** Follows the Keys link. No parameters. */
        goToKeys: goTo('keys'),

        /** Follows the Admin group's Applications link. No parameters. */
        goToApplications: goTo('applications'),

        /** On a desktop, from expanded: Menu turns the drawer into a rail of icons. No parameters. */
        async collapseToRail(...args) {
            parseDslArgs(args, {});

            await driver.collapseToRail();
        },

        /** On a desktop, from a rail: Menu expands the drawer again. No parameters. */
        async expand(...args) {
            parseDslArgs(args, {});

            await driver.expand();
        },

        /** The drawer is a rail of icons. No parameters. */
        async checkIsRail(...args) {
            parseDslArgs(args, {});

            await driver.isRail();
        },

        /** The drawer is expanded, with its headings. No parameters. */
        async checkIsExpanded(...args) {
            parseDslArgs(args, {});

            await driver.isExpanded();
        },

        /**
         * There's no drawer, as for a visitor who isn't logged in. Check where
         * the browser is first, so the page has settled. No parameters.
         */
        async checkIsAbsent(...args) {
            parseDslArgs(args, {});

            await driver.isAbsent();
        },
    };
}
