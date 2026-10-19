import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { application, password, user } from '../params';
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

        /**
         * Opens the login page to sign on to the `application`, one the test
         * added. A logged-in user is sent straight on; anyone else logs in
         * first.
         */
        async openForApplication(...args) {
            const params = parseDslArgs(args, { application: application() });
            const { applicationUrl } = world.applicationNamed(params.application);

            await driver.openForApplication(await world.applicationIdOf(params.application), applicationUrl);
        },

        /** The login page shows, opened for single sign-on to an application. No parameters. */
        async checkIsShownForSignOn(...args) {
            parseDslArgs(args, {});

            await driver.isShownForSignOn();
        },

        /** The browser is at the `application`, signed on to it. */
        async checkSentToApplication(...args) {
            const params = parseDslArgs(args, { application: application() });

            await driver.sentToApplication(world.applicationNamed(params.application).applicationUrl);
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
