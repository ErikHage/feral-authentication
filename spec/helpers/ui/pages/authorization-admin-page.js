import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { application, role, user } from '../params';
import { adminComponents, routedPageSteps } from './routed-page';

/**
 * The authorization admin page, in words. Each step chooses the user first:
 * saving deselects them.
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
