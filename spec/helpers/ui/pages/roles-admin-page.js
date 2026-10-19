import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { role } from '../params';
import { adminComponents, routedPageSteps } from './routed-page';

/**
 * The roles admin page, in words. A role added here is titled by its alias,
 * under a made-up scope unique to the run, and is deleted over the API when
 * the test ends.
 */
export function createRolesAdminPage(world, driver) {
    return {
        ...adminComponents(world),
        ...routedPageSteps(driver),

        /** Adds a new `role` through the Add dialog. */
        async addRole(...args) {
            const params = parseDslArgs(args, { role: role() });

            await driver.addRole(world.newRole(params.role));
        },

        /** Adds the `role` again, with the same scope and title. */
        async addRoleAgain(...args) {
            const params = parseDslArgs(args, { role: role() });

            await driver.addRole(world.roleNamed(params.role));
        },

        /** The `role` is listed with its scope, title and description. */
        async checkRoleIsListed(...args) {
            const params = parseDslArgs(args, { role: role() });

            await driver.listsRole(world.roleNamed(params.role));
        },

        /** After `addRoleAgain`: the second `role` was refused, saying it already exists. */
        async checkDuplicateIsRejected(...args) {
            const params = parseDslArgs(args, { role: role() });

            await driver.showsTheFailedRequest(world.roleNamed(params.role));
        },

        /** Deletes the `role`, confirming in the Delete dialog. */
        async deleteRole(...args) {
            const params = parseDslArgs(args, { role: role() });

            await driver.deleteRole(world.roleNamed(params.role));
        },

        /** After `deleteRole`: the `role` is no longer listed. */
        async checkRoleIsDeleted(...args) {
            const params = parseDslArgs(args, { role: role() });

            await driver.noLongerListsRole(world.roleNamed(params.role));
        },
    };
}
