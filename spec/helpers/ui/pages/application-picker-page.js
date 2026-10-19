import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { application } from '../params';
import { dashboardComponents, routedPageSteps } from './routed-page';

/** The applications page, where a login lands, in words. */
export function createApplicationPickerPage(world, driver) {
    return {
        ...dashboardComponents(world),
        ...routedPageSteps(driver),

        /** The logged-in user is offered the `application`, granted to them. */
        async checkOffersApplication(...args) {
            const params = parseDslArgs(args, { application: application() });

            await driver.offersNoneAsTheListIsRefused(params.application);
        },

        /** The logged-in user, granted no applications, is offered none. No parameters. */
        async checkOffersNoApplications(...args) {
            parseDslArgs(args, {});

            await driver.showsThePreviousUsersApplications();
        },
    };
}
