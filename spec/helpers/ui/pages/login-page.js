import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { password, user } from '../params';

/** The login page, in words. Where a login leads is checked by the destination page. */
export function createLoginPage(world, driver) {
    return {
        /** Opens the page. No parameters. */
        async open(...args) {
            parseDslArgs(args, {});

            await driver.open();
        },

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
    };
}
