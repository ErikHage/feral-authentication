import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { user } from '../params';
import { dashboardComponents, routedPageSteps } from './routed-page';

/** The logged-in user's profile page, in words. */
export function createProfilePage(world, driver) {
    return {
        ...dashboardComponents(world),
        ...routedPageSteps(driver),

        /** The page shows the logged-in `user`'s details. */
        async checkShowsUser(...args) {
            const params = parseDslArgs(args, { user: user() });

            await driver.showsNothingAsTheUserIsRefused(world.credentialsFor(params.user).username);
        },
    };
}
