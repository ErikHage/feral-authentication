import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { password, user } from '../params';
import { routedPageSteps, shellComponents } from './routed-page';

/** The login page, in words. Where a login leads is checked by the destination page. */
export function createLoginPage(world, driver) {
    return {
        ...shellComponents(world),
        ...routedPageSteps(driver),

        /**
         * Logs in as `user` (`admin`, or a user the test created), with
         * optional `password: correct | wrong` (default correct).
         */
        async logIn(...args) {
            const params = parseDslArgs(args, { user: user(), password: password() });
            const credentials = world.credentialsFor(params.user);
            const secret = params.password === 'wrong'
                ? `${credentials.password}-wrong`
                : credentials.password;

            await driver.logIn(credentials.username, secret);
        },

        /** The login was refused with an error, and the browser stayed here. No parameters. */
        async checkLoginIsRejected(...args) {
            parseDslArgs(args, {});

            await driver.showsLoginError();
        },

        /** Goes back in the browser's history. No parameters. */
        async goBack(...args) {
            parseDslArgs(args, {});

            await driver.goBack();
        },

        /** Going back to a page that needs a login showed this page instead. No parameters. */
        async checkIsShownAfterGoingBack(...args) {
            parseDslArgs(args, {});

            await driver.isShownUnderTheApplicationsUrl();
        },
    };
}
