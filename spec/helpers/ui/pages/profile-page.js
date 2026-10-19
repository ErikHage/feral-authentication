import { optional, parseDslArgs, required } from '@feral-auth/ts-simple-dsl';

import { user } from '../params';
import { dashboardComponents, routedPageSteps } from './routed-page';

/** The logged-in user's profile page, in words. */
export function createProfilePage(world, driver) {
    return {
        ...dashboardComponents(world),
        ...routedPageSteps(driver),

        /**
         * The page shows the `user`'s details, with an optional `firstName`
         * they've since saved.
         */
        async checkShowsUser(...args) {
            const params = parseDslArgs(args, { user: user(), firstName: optional() });
            const details = world.userNamed(params.user);

            await driver.showsUser({ ...details, firstName: params.firstName ?? details.firstName });
        },

        /** Types a new `firstName`, without saving. */
        async changeFirstName(...args) {
            const params = parseDslArgs(args, { firstName: required() });

            await driver.changeFirstName(params.firstName);
        },

        /** Empties the first name, without saving. No parameters. */
        async clearFirstName(...args) {
            parseDslArgs(args, {});

            await driver.changeFirstName('');
        },

        /** Presses Save. No parameters. */
        async save(...args) {
            parseDslArgs(args, {});

            await driver.save();
        },

        /** The page says the details were saved. No parameters. */
        async checkDetailsAreSaved(...args) {
            parseDslArgs(args, {});

            await driver.savedDetails();
        },

        /** The first name is required, and Save is disabled. No parameters. */
        async checkCannotSave(...args) {
            parseDslArgs(args, {});

            await driver.cannotSaveAnEmptyFirstName();
        },

        /** The heading still shows the `user`'s saved name while the first name is edited. */
        async checkHeadingIsUnchanged(...args) {
            const params = parseDslArgs(args, { user: user() });

            await driver.headingFollowsTheFirstNameField(world.userNamed(params.user).lastName);
        },

        /**
         * After `previous` logged out and `user` logged in, without a reload,
         * the page shows the `user`'s details.
         */
        async checkShowsNextUser(...args) {
            const params = parseDslArgs(args, { user: user(), previous: user() });

            await driver.showsThePreviousUser(
                world.credentialsFor(params.user).username,
                world.credentialsFor(params.previous).username);
        },

        /** The page shows a `user` without the admin role their details. */
        async checkShowsUserWithoutAdminRole(...args) {
            const params = parseDslArgs(args, { user: user() });

            await driver.showsNothingAsTheUserIsRefused(world.credentialsFor(params.user).username);
        },
    };
}
