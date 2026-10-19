import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { application, key } from '../params';
import { adminComponents, routedPageSteps } from './routed-page';

/**
 * The applications admin page, in words. An application added here gets
 * made-up details, unique to the run, and stays in the database:
 * applications can't be deleted.
 */
export function createApplicationsAdminPage(world, driver) {
    return {
        ...adminComponents(world),
        ...routedPageSteps(driver),

        /** Adds a new `application`, signed with the `key`, through the Add dialog. */
        async addApplication(...args) {
            const params = parseDslArgs(args, { application: application(), key: key() });

            await driver.addApplication(world.newApplication(params.application), world.keyNamed(params.key).keyName);
        },

        /** The `application` is listed with its details. */
        async checkApplicationIsListed(...args) {
            const params = parseDslArgs(args, { application: application() });

            await driver.listsNewApplication(world.applicationNamed(params.application));
        },

        /** Opens the `application`'s details page. */
        async openDetails(...args) {
            const params = parseDslArgs(args, { application: application() });

            await driver.openDetails(world.applicationNamed(params.application).applicationName);
        },
    };
}
