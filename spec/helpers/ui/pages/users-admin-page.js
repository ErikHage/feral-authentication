import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { adminComponents, routedPageSteps } from './routed-page';

/** The users admin page, in words. */
export function createUsersAdminPage(world, driver) {
    return {
        ...adminComponents(world),
        ...routedPageSteps(driver),

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
