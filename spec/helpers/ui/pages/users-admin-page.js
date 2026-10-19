import { parseDslArgs, required } from '@feral-auth/ts-simple-dsl';

import { user } from '../params';
import { adminComponents, routedPageSteps } from './routed-page';

/**
 * The users admin page, in words. A user added here gets made-up details,
 * unique to the run, and is deleted over the API when the test ends.
 */
export function createUsersAdminPage(world, driver) {
    return {
        ...adminComponents(world),
        ...routedPageSteps(driver),

        /** Adds a new `user`, with made-up details, through the Add dialog. */
        async addUser(...args) {
            const params = parseDslArgs(args, { user: user() });

            await driver.addUser(world.newUser(params.user));
        },

        /** The `user` is listed with their details. */
        async checkUserIsListed(...args) {
            const params = parseDslArgs(args, { user: user() });

            await driver.listsNewUser(world.userNamed(params.user));
        },

        /** Changes the `user`'s `firstName` through the Edit dialog. */
        async renameUser(...args) {
            const params = parseDslArgs(args, { user: user(), firstName: required() });

            await driver.renameUser(world.userNamed(params.user).username, params.firstName);
        },

        /** The `user` is listed under their new `firstName`. */
        async checkUserIsRenamed(...args) {
            const params = parseDslArgs(args, { user: user(), firstName: required() });

            await driver.rejectsTheRenameAsANewUser(world.userNamed(params.user), params.firstName);
        },

        /** Deletes the `user`, confirming in the Delete dialog. */
        async deleteUser(...args) {
            const params = parseDslArgs(args, { user: user() });

            await driver.deleteUser(world.userNamed(params.user).username);
        },

        /** After `deleteUser`: the `user` is no longer listed. */
        async checkUserIsDeleted(...args) {
            const params = parseDslArgs(args, { user: user() });

            await driver.noLongerListsUser(world.userNamed(params.user).username);
        },

        /** Reloads the page. No parameters. */
        async reload(...args) {
            parseDslArgs(args, {});

            await driver.reload();
        },

        /** The page is still shown after a reload. No parameters. */
        async checkIsShownAfterReload(...args) {
            parseDslArgs(args, {});

            await driver.landsOnApplicationsPageAfterReload();
        },
    };
}
