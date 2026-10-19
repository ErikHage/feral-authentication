import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { dashboardComponents, routedPageSteps } from './routed-page';

/** The logged-in user's sessions page, in words. */
export function createSessionsPage(world, driver) {
    return {
        ...dashboardComponents(world),
        ...routedPageSteps(driver),

        /** The page lists the session the user is logged in with. No parameters. */
        async checkListsCurrentSession(...args) {
            parseDslArgs(args, {});

            await driver.showsTheRefusal();
        },
    };
}
