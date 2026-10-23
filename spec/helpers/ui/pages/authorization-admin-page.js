import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { application, role, user } from '../params';
import { adminComponents, routedPageSteps } from './routed-page';

/**
 * The authorization admin page, in words. Each step that saves chooses the
 * user first: saving deselects them. The steps that add without saving work
 * on the user chosen with `chooseUser`.
 */
export function createAuthorizationAdminPage(world, driver) {
    const usernameOf = alias => world.credentialsFor(alias).username;

    // A role the test added, or an existing one named `scope/title`
    const roleLabelOf = alias => {
        if (alias.includes('/')) {
            return alias;
        }
        const { scope, title } = world.roleNamed(alias);
        return `${scope}/${title}`;
    };

    return {
        ...adminComponents(world),
        ...routedPageSteps(driver),

        /** Gives the `user` the `role`, through the Manage Roles card. */
        async grantRole(...args) {
            const params = parseDslArgs(args, { user: user(), role: role() });

            await driver.grantRole(usernameOf(params.user), roleLabelOf(params.role));
        },

        /** Gives the `user` the `application`, through the Manage Applications card. */
        async grantApplication(...args) {
            const params = parseDslArgs(args, { user: user(), application: application() });

            await driver.grantApplication(usernameOf(params.user), world.applicationNameOf(params.application));
        },

        /** Chooses the `user`, whose applications and roles the next steps change. */
        async chooseUser(...args) {
            const params = parseDslArgs(args, { user: user() });

            await driver.chooseUser(usernameOf(params.user));
        },

        /** Adds the `application` to the chosen user's, without saving. */
        async addApplication(...args) {
            const params = parseDslArgs(args, { application: application() });

            await driver.addApplication(world.applicationNameOf(params.application));
        },

        /** Adds the `role` to the chosen user's, without saving. */
        async addRole(...args) {
            const params = parseDslArgs(args, { role: role() });

            await driver.addRole(roleLabelOf(params.role));
        },

        /** Presses Cancel in the Manage Roles card. No parameters. */
        async cancelRoles(...args) {
            parseDslArgs(args, {});

            await driver.cancelRoles();
        },

        /** The `role` added without saving is gone, and the user is still chosen. */
        async checkRoleIsNotAdded(...args) {
            const params = parseDslArgs(args, { role: role() });

            await driver.dropsTheRoleKeepingTheUser(roleLabelOf(params.role));
        },

        /** The `application` added without saving is still there. */
        async checkApplicationIsStillAdded(...args) {
            const params = parseDslArgs(args, { application: application() });

            await driver.stillAddsApplication(world.applicationNameOf(params.application));
        },

        /** Choosing the `user` shows they have the `role`. */
        async checkUserHasRole(...args) {
            const params = parseDslArgs(args, { user: user(), role: role() });

            await driver.showsRole(usernameOf(params.user), roleLabelOf(params.role));
        },

        /** Choosing the `user` shows they have the `application`. */
        async checkUserHasApplication(...args) {
            const params = parseDslArgs(args, { user: user(), application: application() });

            await driver.showsApplication(usernameOf(params.user), world.applicationNameOf(params.application));
        },
    };
}
