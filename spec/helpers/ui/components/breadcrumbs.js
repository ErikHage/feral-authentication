import { parseDslArgs, required } from '@feral-auth/ts-simple-dsl';

import { application } from '../params';

// The drawer's sections, which head the trail
const section = () => required().allowedValues('User', 'Admin');

/**
 * The breadcrumbs in the toolbar, in words. Every page object exposes them
 * as `breadcrumbs`. Where a step leads is checked by the destination page.
 */
export function createBreadcrumbs(world, driver) {
    return {
        /** Follows the `section` crumb, User or Admin, to its first page. */
        async goToSection(...args) {
            const params = parseDslArgs(args, { section: section() });

            await driver.goToSection(params.section);
        },

        /** Follows the Applications crumb, back to the list. No parameters. */
        async goToApplications(...args) {
            parseDslArgs(args, {});

            await driver.goToApplications();
        },

        /**
         * `section`, `page`: the trail reads the section, as a link, then the
         * page by its name in the drawer.
         */
        async checkLeadsToPage(...args) {
            const params = parseDslArgs(args, { section: section(), page: required() });

            await driver.leadsToPage(params.section, params.page);
        },

        /**
         * `application`: the trail reads Admin and Applications, as links,
         * then the application.
         */
        async checkLeadsToApplication(...args) {
            const params = parseDslArgs(args, { application: application() });

            await driver.leadsToApplication(world.applicationNamed(params.application));
        },

        /** `page`: the trail is the page alone, as on a phone. */
        async checkShowsOnlyPage(...args) {
            const params = parseDslArgs(args, { page: required() });

            await driver.showsOnlyPage(params.page);
        },
    };
}
