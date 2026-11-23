import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { application } from '../params';
import { shellComponents, routedPageSteps } from './routed-page';

/** The applications page, where a login lands, in words. */
export function createApplicationPickerPage(world, driver) {
    return {
        ...shellComponents(world),
        ...routedPageSteps(driver),

        /**
         * Goes to the dashboard's own URL, `/dashboard`, which opens this, its
         * first page. `checkIsShown` checks it did. No parameters.
         */
        async openArea(...args) {
            parseDslArgs(args, {});

            await driver.openArea();
        },

        /** The logged-in user is offered the `application`, granted to them. */
        async checkOffersApplication(...args) {
            const params = parseDslArgs(args, { application: application() });

            await driver.offersApplication(world.applicationNameOf(params.application));
        },

        /** The logged-in user, granted no applications, is offered none. No parameters. */
        async checkOffersNoApplications(...args) {
            parseDslArgs(args, {});

            await driver.offersNoApplications();
        },
    };
}
