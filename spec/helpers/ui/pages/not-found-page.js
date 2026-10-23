import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { routedPageSteps, shellComponents } from './routed-page';

/** What an unknown URL shows, in words. */
export function createNotFoundPage(world, driver) {
    return {
        ...shellComponents(world),
        ...routedPageSteps(driver),

        /** Follows the link to the home page. No parameters. */
        async goHome(...args) {
            parseDslArgs(args, {});

            await driver.goHome();
        },
    };
}
