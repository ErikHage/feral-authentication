import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { routedPageSteps, shellComponents } from './routed-page';

/** The public landing page, at the app's root, in words. */
export function createPublicPage(world, driver) {
    return {
        ...shellComponents(world),
        ...routedPageSteps(driver),

        /** Follows the Login link. No parameters. */
        async goToLogin(...args) {
            parseDslArgs(args, {});

            await driver.goToLogin();
        },
    };
}
