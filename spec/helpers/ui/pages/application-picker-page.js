import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

/**
 * The dashboard's applications page, where a logged-in user picks an
 * application to go to, in words. It's where a login lands.
 */
export function createApplicationPickerPage(world, driver) {
    return {
        /** The browser is on the applications page. No parameters. */
        async checkIsShown(...args) {
            parseDslArgs(args, {});

            await driver.isShown();
        },
    };
}
